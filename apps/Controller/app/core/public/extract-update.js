const ensure = require("#tvf-ensure");
const getAssetPagesWithoutExcludedPages = require("./common/getAssetPagesWithoutExcludedPages");
const generateExtractViewUrlsWrap = require("./common/generateExtractViewUrlsWrap");
const getExtractPagesForCourse = require("../../common/getExtractPagesForCourse");
const updateExtractCoursePage = require("../../common/updateExtractCoursePage");
const getCopyableSortedPages = require("./common/getCopyableSortedPages");
const validateExtract = require("./common/validateExtract");
const getExtractPagesForSchool = require("../../common/getExtractPagesForSchool");
const updateExtractSchoolPage = require("../../common/updateExtractSchoolPage");
const getExtractLimitPercentage = require("./common/getExtractLimitPercentage");
const { extractStatus } = require("../../common/staticValues");
const getSchoolIdFromExtract = require("./common/getSchoolIdFromExtract");
const updateExtractNote = require("./common/updateExtractNote");
const updateExtractHighlight = require("./common/updateExtractHighlight");
const generateWatermarkedImages = require("./extract-create/process");
const getTeacherName = require("./common/getTeacherName");
const getWatermarkText = require("./common/getWatermarkText");

module.exports = async function (params, ctx, generateExtractViewUrls, asyncRunner) {
	//extract update
	await ctx.ensureLoggedIn();
	ensure.validIdentifier(ctx, params.extract_oid, "extract_oid");
	await validateExtract(ctx, params);
	const sessionData = await ctx.getSessionData();

	const schoolId = await getSchoolIdFromExtract(ctx, params.extract_oid);

	const values = [];
	const whereClause = [
		"(extract.archive_date IS NULL)",
		`(extract.oid = $${values.push(params.extract_oid)})`,
		`(extract.school_id=$${values.push(schoolId)})`,
		`(extract.asset_user_upload_id IS NULL)`,
	];

	//ensue with the school id if user not a cl-admin
	const extractResult = await ctx.appDbQuery(
		`
			SELECT
				extract.id AS extract_id,
				extract.pages As pages,
				COALESCE(extract.date_expired <= NOW(), FALSE) AS expired,
				extract.date_expired AS date_expired,
				extract.date_created AS date_created,
				extract.course_id AS course_id,
				course.oid AS course_oid,
				course.title AS course_name,
				asset.id AS asset_id,
				asset.page_count AS asset_page_count,
				asset.copyable_page_count AS copyable_page_count,
				asset.title AS work_title,
				asset.copy_excluded_pages AS copy_excluded_pages,
				extract.status AS extract_status,
				extract.grace_period_end AS grace_period_end,
				school.name AS school_name,
				extract.asset_user_upload_id IS NOT NULL AS is_user_uploaded_extract
			FROM
				extract
			INNER JOIN asset
				ON extract.asset_id = asset.id
			INNER JOIN course
				ON extract.course_id = course.id
			INNER JOIN school
				ON extract.school_id = school.id
			WHERE
				${whereClause.join(" AND ")}
		`,
		values
	);

	if (!extractResult.rowCount) {
		ctx.throw(400, "extract not found");
	}

	const extract = extractResult.rows[0];
	if (extract.expired) {
		ctx.throw(400, "extract expired");
	}

	if (!extract.asset_id) {
		ctx.throw(400, "Asset not found");
	}

	ctx.assert(extract.extract_status === extractStatus.editable, 400, "extract can not be editable");
	ctx.assert(extract.grace_period_end.getTime() > Date.now(), 400, "extract grace_period_end is expired");

	extract.asset_id = parseInt(extract.asset_id, 10);
	extract.asset_page_count = parseInt(extract.asset_page_count, 10);
	extract.copyable_page_count = parseInt(extract.copyable_page_count, 10);
	// get school name
	const schoolName = extract.school_name;
	let courseId = extract.course_id;
	let courseName = extract.course_name;

	const sortedPages = getCopyableSortedPages(params.pages, extract.copy_excluded_pages);
	ctx.assert(sortedPages.length > 0, 400, "No copyable pages provided");

	// ensure no page number exceeds the page count of the asset
	if (sortedPages[sortedPages.length - 1] > extract.asset_page_count) {
		ctx.throw(400, "Supplied page exceeds asset page count");
	}

	let pageRangeChanged = false;
	let oldPageRange = extract.pages;
	let newPageRange = sortedPages;
	let courseChanged = false;
	let oldCourseId = extract.course_id;
	let newCourseId;

	// get teacher name
	const teacherName = await getTeacherName(ctx, sessionData.user_id);
	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		const querier = ctx.appDbQuery.bind(ctx);
		await client.query("BEGIN");

		courseChanged = extract.course_oid !== params.course_oid;

		//when user update course
		if (courseChanged) {
			const courseData = await ctx.appDbQuery(
				`
					SELECT
						id,
						title
					FROM
						course
					WHERE
						oid = $1
						AND school_id = $2
						AND archive_date is null
				`,
				[params.course_oid, schoolId]
			);
			if (Array.isArray(courseData.rows) && courseData.rows.length) {
				courseId = parseInt(courseData.rows[0].id, 10);
				courseName = courseData.rows[0].title;
			}

			if (!courseId) {
				ctx.throw(400, "Course not found");
			}
			newCourseId = courseId;
			const extractAssetPrevCoursePagesMap = await getExtractPagesForCourse(
				querier,
				schoolId,
				extract.asset_id,
				extract.extract_id,
				extract.course_id
			);
			await updateExtractCoursePage(client.query.bind(client), extract.asset_id, extract.course_id, extractAssetPrevCoursePagesMap);

			const extractAssetSchoolPrevCoursePagesMap = await getExtractPagesForSchool(querier, schoolId, extract.asset_id, extract.extract_id);
			await updateExtractSchoolPage(client.query.bind(client), extract.asset_id, schoolId, extractAssetSchoolPrevCoursePagesMap);
		}

		pageRangeChanged = JSON.stringify(sortedPages) !== JSON.stringify(extract.pages);

		if (pageRangeChanged || courseChanged) {
			const extractAssetCoursePages = await getExtractPagesForCourse(querier, schoolId, extract.asset_id, extract.extract_id, courseId, sortedPages);

			const extractAssetSchoolPages = await getExtractPagesForSchool(querier, schoolId, extract.asset_id, extract.extract_id, sortedPages);

			const extractLimitPercentage = await getExtractLimitPercentage(querier, params.work_isbn13);
			const allowedExtractRatio = extractLimitPercentage.class;
			const allowedExtractRatioBySchool = extractLimitPercentage.school;

			ctx.assert(allowedExtractRatio > 0, 401, "You do not have permission to create extracts [1]");
			ctx.assert(allowedExtractRatioBySchool > 0, 401, "You do not have permission to create extracts [2]");

			if (extractAssetCoursePages.length > Math.ceil(extract.copyable_page_count * allowedExtractRatio)) {
				ctx.throw(400, "Would exceed extract limit for course");
			}
			if (extractAssetSchoolPages.length > Math.ceil(extract.copyable_page_count * allowedExtractRatioBySchool)) {
				ctx.throw(400, "Would exceed extract limit for school");
			}

			await updateExtractCoursePage(client.query.bind(client), extract.asset_id, courseId, extractAssetCoursePages);
			await updateExtractSchoolPage(client.query.bind(client), extract.asset_id, schoolId, extractAssetSchoolPages);

			//update extract notes
			await updateExtractNote(client.query.bind(client), extract.extract_id, sortedPages);
			//update extract highlight
			await updateExtractHighlight(client.query.bind(client), extract.extract_id, sortedPages);
		}
		await client.query(
			`
				UPDATE
					extract
				SET
					title = $1,
					exam_board= $2,
					students_in_course=$3,
					course_id=$4,
					course_name_log=$5,
					page_count=$6,
					pages=$7,
					date_edited = NOW(),
					modified_by_user_id = $9
				WHERE
					oid = $8
					AND archive_date IS NULL
			`,
			[
				params.extract_title,
				params.exam_board || null,
				params.students_in_course,
				courseId,
				courseName,
				sortedPages.length,
				JSON.stringify(sortedPages),
				params.extract_oid,
				sessionData.user_id,
			]
		);
		await client.query("COMMIT");
		//add task into the asyncRunner for send alert email
		await asyncRunner.pushTask({
			// at most one task for any asset/school combination should be in the async queue at any one time.
			key: "sendAssetAlertExtractLimit//" + extract.asset_id + "/" + schoolId,
			callback: `sendAssetAlertExtractLimit`,
			dateToExecute: new Date(Date.now() + 10 * 60 * 1000), // 10 mins in the future
			data: {
				asset_id: extract.asset_id,
				school_id: schoolId,
			},
		});
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}

	let viewUrls = null;
	if (!extract.is_user_uploaded_extract) {
		const pagesWithoutExcludedPages = getAssetPagesWithoutExcludedPages(sortedPages, extract.copy_excluded_pages);

		const watermarkText = getWatermarkText(teacherName, schoolName, extract.date_expired);
		await generateWatermarkedImages(watermarkText, params.extract_oid, params.work_isbn13, pagesWithoutExcludedPages);

		viewUrls = await generateExtractViewUrlsWrap(
			generateExtractViewUrls,
			pagesWithoutExcludedPages,
			true,
			params.work_isbn13,
			params.extract_oid,
			sortedPages,
			extract.copy_excluded_pages
		);
	}

	await ctx.appDbQuery(
		`
			INSERT INTO
				extract_status_change_event
				(
					category,
					user_id,
					extract_id,
					old_page_range,
					new_page_range,
					page_range_changed,
					old_course_id,
					new_course_id,
					course_changed
				)
			VALUES
				(
					'update',
					$1,
					$2,
					$3,
					$4,
					$5,
					$6,
					$7,
					$8
				)
		`,
		[
			sessionData.user_id,
			extract.extract_id,
			pageRangeChanged ? JSON.stringify(oldPageRange) : null,
			pageRangeChanged ? JSON.stringify(newPageRange) : null,
			pageRangeChanged,
			courseChanged ? oldCourseId : null,
			courseChanged ? newCourseId : null,
			courseChanged,
		]
	);

	return {
		extract: {
			oid: params.extract_oid,
			title: params.extract_title,
			course_oid: params.course_oid,
			course_name: courseName,
			work_isbn13: params.work_isbn13,
			work_title: extract.work_title,
			exam_board: params.exam_board,
			students_in_course: params.students_in_course,
			page_count: sortedPages.length,
			date_created: extract.date_created,
			pages: sortedPages,
			is_watermarked: true,
		},
		urls: viewUrls,
	};
};
