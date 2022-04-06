const tvfUtil = require("#tvf-util");
const ensure = require("#tvf-ensure");
const getExtractExpiryDate = require(`../../common/getExtractExpiryDate`);
const getExtractLimitPercentage = require("./common/getExtractLimitPercentage");
const generateWatermarkedImages = require("./extract-create/process");
const getAssetPagesWithoutExcludedPages = require("./common/getAssetPagesWithoutExcludedPages");
const generateExtractViewUrlsWrap = require("./common/generateExtractViewUrlsWrap");
const { extractStatus, extractEditableGracePeriodLimit, userRoles } = require("../../common/staticValues");
const getCopyableSortedPages = require("./common/getCopyableSortedPages");
const validateExtract = require("./common/validateExtract");
const getTeacherName = require("./common/getTeacherName");
const getWatermarkText = require("./common/getWatermarkText");
const getAsset = require("./extract-create/getAsset");
const canCopyForCourse = require("./extract-create/canCopyForCourse");
const canCopyForSchool = require("./extract-create/canCopyForSchool");
const getCourseDetails = require("./extract-create/getCourseDetails");
const createExtract = require("./user-asset-upload/createExtract");

const getExtractDetailByOid = async (ctx, retriveFields, oid, userId) => {
	const whereClauses = [];
	const binds = [];
	whereClauses.push(`oid = $${binds.push(oid)}`);
	whereClauses.push(`archive_date IS NULL`);
	if (userId) {
		whereClauses.push(`user_id = $${binds.push(userId)}`);
	}
	const extractResult = await ctx.appDbQuery(
		`
			SELECT
				${retriveFields.join(", ")}
			FROM
				extract
			WHERE
				${whereClauses.join(" AND ")}
		`,
		binds
	);
	if (!extractResult.rowCount) {
		ctx.throw(400, "Extract not found");
	}
	return extractResult.rows[0];
};

module.exports = async function (params, ctx, generateExtractViewUrls, asyncRunner) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();

	if (sessionData.user_role !== userRoles.teacher && sessionData.user_role !== userRoles.schoolAdmin) {
		ctx.throw(401, "Unauthorized");
	}
	ctx.assert(sessionData.school_id, 401, "You must be associated with a school to create an extract");

	if (params.rollover_review_oid) {
		ensure.validIdentifier(ctx, params.rollover_review_oid, "rollover_review_oid");
	}
	if (params.clone_from_extract_oid) {
		ensure.validIdentifier(ctx, params.clone_from_extract_oid, "clone_from_extract_oid");
	}
	if (params.asset_user_upload_oid) {
		ensure.validIdentifier(ctx, params.asset_user_upload_oid, "asset_user_upload_oid");
	}

	await validateExtract(ctx, params);

	const querier = ctx.appDbQuery.bind(ctx);
	// ensure the course oid exists within the user's school
	const course = await getCourseDetails(querier, params.course_oid, sessionData.school_id);
	if (!course) {
		ctx.throw(400, "Course not found");
	}

	// ensure the asset exists AND is unlocked
	const asset = await getAsset(querier, params.work_isbn13, sessionData.school_id);
	ctx.assert(asset, 400, "Asset not found");

	if (params.asset_user_upload_oid) {
		const result = await ctx.appDbQuery(
			`
				SELECT
					asset_user_upload.id AS id,
					asset_user_upload.pages AS pages
				FROM
					asset_user_upload
				INNER JOIN cla_user
					ON asset_user_upload.user_id = cla_user.id
				WHERE
					asset_user_upload.oid = $1
					AND cla_user.school_id = $2
			`,
			[params.asset_user_upload_oid, sessionData.school_id]
		);
		ctx.assert(result.rowCount, 400, "Upload not found");
		const copiedPages = result.rows[0].pages.sort((a, b) => a - b);
		const selectedPages = params.pages.sort((a, b) => a - b);
		ctx.assert(JSON.stringify(selectedPages) === JSON.stringify(copiedPages), 400, "Please select the same pages to create a copy.");
		const copyExtractOid = await createExtract(
			querier,
			asyncRunner.pushTask.bind(asyncRunner),
			asset,
			result.rows[0].id,
			sessionData.user_id,
			params.course_oid,
			sessionData.school_id,
			params.pages,
			params.extract_title,
			params.students_in_course,
			params.exam_board
		);

		return {
			extract: {
				oid: copyExtractOid,
				title: params.extract_title,
				course_oid: params.course_oid,
				course_name: course.title,
				work_isbn13: params.work_isbn13,
				work_title: asset.title,
				exam_board: params.exam_board,
				students_in_course: params.students_in_course,
				page_count: selectedPages.length,
				pages: selectedPages,
			},
			urls: null,
		};
	}

	const extractLimitPercentage = await getExtractLimitPercentage(querier, params.work_isbn13);

	const sortedPages = getCopyableSortedPages(params.pages, asset.copy_excluded_pages);
	ctx.assert(sortedPages.length > 0, 400, "No copyable pages provided");

	// ensure no page number exceeds the page count of the asset
	if (sortedPages[sortedPages.length - 1] > asset.page_count) {
		ctx.throw(400, "Supplied page exceeds asset page count");
	}

	// ensure it is possible to create the extract - check for course limits
	if (!(await canCopyForCourse(querier, course.id, asset, sortedPages, extractLimitPercentage.class))) {
		ctx.throw(400, "Would exceed extract limit for course");
	}

	// ensure it is possible to create the extract - check for school-wide limits
	if (!(await canCopyForSchool(querier, sessionData.school_id, asset, sortedPages, extractLimitPercentage.school))) {
		ctx.throw(400, "Would exceed extract limit for school");
	}

	// get teacher name
	const teacherName = await getTeacherName(ctx, sessionData.user_id);

	const pagesWithoutExcludedPages = getAssetPagesWithoutExcludedPages(sortedPages, asset.copy_excluded_pages);

	let dateExpired = getExtractExpiryDate(new Date(), course.academic_year_end_month, course.academic_year_end_day);
	if (asset.expiration_date) {
		dateExpired = asset.expiration_date;
	}
	//add task into the asyncRunner for send alert email
	await asyncRunner.pushTask({
		// At most one task for any asset/school combination should be in the async queue at any one time.
		key: "sendAssetAlertExtractLimit//" + asset.id + "/" + sessionData.school_id,
		callback: `sendAssetAlertExtractLimit`,
		dateToExecute: new Date(Date.now() + 10 * 60 * 1000), // 10 mins in the future
		data: {
			asset_id: asset.id,
			school_id: sessionData.school_id,
		},
	});

	let dateCreated;
	let isReactivateCopy = false;
	let isRollOverExtractExpired = false;

	if (params.rollover_review_oid) {
		const retriveFields = ["id", "pages", "COALESCE(date_expired <= NOW(), FALSE) AS expired", "date_created"];
		const extractResult = await getExtractDetailByOid(ctx, retriveFields, params.rollover_review_oid, sessionData.user_id);
		dateCreated = extractResult.date_created;
		isRollOverExtractExpired = extractResult.expired;
		const extractPages = extractResult.pages.sort(function (a, b) {
			return a - b;
		});
		//compare with string
		if (JSON.stringify(sortedPages) === JSON.stringify(extractPages)) {
			isReactivateCopy = true;
			//reactivate the copy based on rollover_review_oid
			await ctx.appDbQuery(
				`
					UPDATE
						extract
					SET
						date_expired = $1,
						title = $2,
						exam_board = $3,
						students_in_course = $4,
						course_id = $5,
						course_name_log = $6,
						status = $7,
						grace_period_end = NOW() + interval '${extractEditableGracePeriodLimit} days',
						modified_by_user_id = $9,
						date_edited = NOW()
					WHERE
						oid = $8
				`,
				[
					dateExpired,
					params.extract_title,
					params.exam_board || null,
					params.students_in_course,
					course.id,
					course.title,
					extractStatus.editable,
					params.rollover_review_oid,
					sessionData.user_id,
				]
			);
			//reactivate the copy based on extract_id
			await ctx.appDbQuery(
				`
					UPDATE
						extract_share
					SET
						date_expired = $1,
						modified_by_user_id = $2,
						date_edited = NOW()
					WHERE
						extract_id = $3
				`,
				[dateExpired, sessionData.user_id, extractResult.id]
			);
		}
	}
	//check for update number_of_students in course
	if (params.setCourseDefaultNoOfStudent && params.rollover_review_oid && isRollOverExtractExpired) {
		await ctx.appDbQuery(
			`
				UPDATE 
					course 
				SET 
					number_of_students = $1,
					modified_by_user_id = $2,
					date_edited = NOW()
				WHERE
					oid = $3
			`,
			[params.students_in_course, sessionData.user_id, params.course_oid]
		);
	}
	let cloneFromExtractId = null;
	if (params.clone_from_extract_oid) {
		const extractResult = await getExtractDetailByOid(
			ctx,
			["id", "status", "date_expired <= NOW() AS expired", "school_id"],
			params.clone_from_extract_oid
		);
		if (sessionData.school_id !== extractResult.school_id) {
			ctx.throw(400, "You are not able to clone the extract from another institution extract");
		}
		if (extractResult.status === extractStatus.cancelled || extractResult.expired) {
			ctx.throw(400, "Extract not cloneable");
		}
		cloneFromExtractId = extractResult.id;
	}

	let extractOid;
	if (isReactivateCopy) {
		extractOid = params.rollover_review_oid;
	} else {
		extractOid = await tvfUtil.generateObjectIdentifier();
	}
	const watermarkText = getWatermarkText(teacherName, course.school_name, dateExpired);
	await generateWatermarkedImages(watermarkText, extractOid, params.work_isbn13, pagesWithoutExcludedPages);

	if (!isReactivateCopy) {
		const results = await ctx.appDbQuery(
			`
				INSERT INTO
					extract
					(title, asset_id, exam_board, students_in_course, page_count, oid, course_id, pages, school_id, user_id, course_name_log, date_expired, is_watermarked, cloned_from_extract_id)
				VALUES
					($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, $13)
				RETURNING
					date_created
			`,
			[
				params.extract_title,
				asset.id,
				params.exam_board || null,
				params.students_in_course,
				sortedPages.length,
				extractOid,
				course.id,
				JSON.stringify(sortedPages),
				sessionData.school_id,
				sessionData.user_id,
				course.title,
				dateExpired,
				cloneFromExtractId,
			]
		);
		dateCreated = results.rows[0].date_created;
	}

	const extractPagesByCourse = sortedPages.map((page) => `(${course.id},${asset.id},${page})`).join(",");
	await ctx.appDbQuery(`
		INSERT INTO
			extract_page
			(course_id, asset_id, page_number)
		VALUES
			${extractPagesByCourse}
		ON CONFLICT DO NOTHING
	`);

	const extractPagesBySchool = sortedPages.map((page) => `(${sessionData.school_id},${asset.id},${page})`).join(",");
	await ctx.appDbQuery(`
		INSERT INTO
			extract_page_by_school
			(school_id, asset_id, page_number)
		VALUES
			${extractPagesBySchool}
		ON CONFLICT DO NOTHING
	`);

	const viewUrls = await generateExtractViewUrlsWrap(
		generateExtractViewUrls,
		pagesWithoutExcludedPages,
		true,
		params.work_isbn13,
		extractOid,
		sortedPages,
		asset.copy_excluded_pages
	);
	return {
		extract: {
			oid: extractOid,
			title: params.extract_title,
			course_oid: params.course_oid,
			course_name: course.title,
			work_isbn13: params.work_isbn13,
			work_title: asset.title,
			exam_board: params.exam_board,
			students_in_course: params.students_in_course,
			page_count: sortedPages.length,
			date_created: dateCreated,
			pages: sortedPages,
			is_watermarked: true,
		},
		urls: viewUrls,
	};
};
