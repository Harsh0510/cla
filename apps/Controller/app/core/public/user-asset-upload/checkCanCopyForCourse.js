const staticValues = require("../../../common/staticValues");

const SUCCESS = 0;
const EXCEEDED_COURSE_LIMIT = 1;
const EXCEEDED_GLOBAL_LIMIT = 2;

const getCopyStatus = async (querier, courseId, asset, pages) => {
	let pagesAlreadyExtractedForCourse = [];
	{
		const results = await querier(
			`
				SELECT
					page_number
				FROM
					extract_page
				WHERE
					course_id = $1
					AND asset_id = $2
					AND archive_date IS NULL
			`,
			[courseId, asset.id]
		);
		pagesAlreadyExtractedForCourse = results.rows.map((row) => row.page_number);
	}
	const origPageCountExtractedForCourse = pagesAlreadyExtractedForCourse.length;
	const pagesAlreadyExtractedForCourseByPageNum = Object.create(null);
	for (const pageNumber of pagesAlreadyExtractedForCourse) {
		pagesAlreadyExtractedForCourseByPageNum[pageNumber] = true;
	}
	let newPageCountExtractedForCourse = origPageCountExtractedForCourse;
	for (const pageNumber of pages) {
		if (!pagesAlreadyExtractedForCourseByPageNum[pageNumber]) {
			pagesAlreadyExtractedForCourseByPageNum[pageNumber] = true;
			newPageCountExtractedForCourse++;
		}
	}
	if (newPageCountExtractedForCourse === origPageCountExtractedForCourse) {
		// no new pages being copied, so it's fine
		return SUCCESS;
	}
	const maxAllowedCourseRatio = Math.ceil(asset.copyable_page_count * 0.05);
	const maxAllowedCopyRatio = Math.ceil(asset.copyable_page_count * staticValues.allowedPercentageForUserUploadedCopy * 0.01);
	if (newPageCountExtractedForCourse > maxAllowedCopyRatio) {
		// would exceed global limit for user uploads
		return EXCEEDED_GLOBAL_LIMIT;
	}
	if (origPageCountExtractedForCourse >= maxAllowedCourseRatio) {
		// already copied 5% or more for this course for this asset
		return EXCEEDED_COURSE_LIMIT;
	}
	return SUCCESS;
};

module.exports = async (querier, courseId, asset, pages) => {
	const status = await getCopyStatus(querier, courseId, asset, pages);
	if (status === SUCCESS) {
		return;
	}
	let msg;
	if (status === EXCEEDED_COURSE_LIMIT) {
		msg =
			"You have exceeded the copying allowance for this class. If this class was selected in error, please change your selection. If you've selected the correct class, please contact support for further clarification.";
	} else {
		msg = "The copying allowance for this book has already been reached. Please contact support for further clarification.";
	}
	const e = new Error(msg);
	e.status = 400;
	e.expose = true;
	throw e;
};
