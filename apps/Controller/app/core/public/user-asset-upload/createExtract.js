const tvfUtil = require("#tvf-util");

const getExtractExpiryDate = require(`../../../common/getExtractExpiryDate`);
const getExtractLimitPercentage = require("../common/getExtractLimitPercentage");
const checkCanCopyForCourse = require("./checkCanCopyForCourse");
const canCopyForSchool = require("../extract-create/canCopyForSchool");
const getCourseDetails = require("../extract-create/getCourseDetails");

module.exports = async (querier, asyncTaskPush, asset, assetUserUploadId, userId, courseOid, schoolId, pages, title, studentsInCourse, examBoard) => {
	const extractLimitPercentage = await getExtractLimitPercentage(querier, asset.id, "id");

	const course = await getCourseDetails(querier, courseOid, schoolId);
	if (!course) {
		const e = new Error("Course not found");
		e.status = 400;
		e.expose = true;
		throw e;
	}

	// ensure it is possible to create the extract - check for course limit
	await checkCanCopyForCourse(querier, course.id, asset, pages);

	// ensure it is possible to create the extract - check for school-wide limits
	if (!(await canCopyForSchool(querier, schoolId, asset, pages, extractLimitPercentage.school))) {
		const e = new Error("Would exceed extract limit for school");
		e.status = 400;
		e.expose = true;
		throw e;
	}

	const dateExpired = getExtractExpiryDate(new Date(), course.academic_year_end_month, course.academic_year_end_day);

	// add task into the asyncRunner for send alert email
	await asyncTaskPush({
		// At most one task for any asset/school combination should be in the async queue at any one time.
		key: "sendAssetAlertExtractLimit//" + asset.id + "/" + schoolId,
		callback: `sendAssetAlertExtractLimit`,
		dateToExecute: new Date(Date.now() + 10 * 60 * 1000), // 10 mins in the future
		data: {
			asset_id: asset.id,
			school_id: schoolId,
		},
	});

	const extractOid = await tvfUtil.generateObjectIdentifier();

	await querier(
		`
			INSERT INTO
				extract
				(
					title,
					asset_id,
					page_count,
					oid,
					course_id,
					pages,
					school_id,
					user_id,
					course_name_log,
					date_expired,
					is_watermarked,
					asset_user_upload_id,
					status,
					grace_period_end,
					modified_by_user_id,
					students_in_course,
					exam_board
				)
			VALUES
				(
					$1,
					$2,
					$3,
					$4,
					$5,
					$6,
					$7,
					$8,
					$9,
					$10,
					FALSE,
					$11,
					'active',
					NOW() - INTERVAL '1 hour',
					$12,
					$13,
					$14
				)
		`,
		[
			title,
			asset.id,
			pages.length,
			extractOid,
			course.id,
			JSON.stringify(pages),
			schoolId,
			userId,
			course.title,
			dateExpired,
			assetUserUploadId || null,
			userId,
			studentsInCourse,
			examBoard || null,
		]
	);

	const extractPagesByCourse = pages.map((page) => `(${course.id},${asset.id},${page})`).join(",");
	await querier(`
		INSERT INTO
			extract_page
			(course_id, asset_id, page_number)
		VALUES
			${extractPagesByCourse}
		ON CONFLICT DO NOTHING
	`);

	const extractPagesBySchool = pages.map((page) => `(${schoolId},${asset.id},${page})`).join(",");
	await querier(`
		INSERT INTO
			extract_page_by_school
			(school_id, asset_id, page_number)
		VALUES
			${extractPagesBySchool}
		ON CONFLICT DO NOTHING
	`);

	return extractOid;
};
