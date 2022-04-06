module.exports = async (querier, courseId, asset, pages, allowedCopyRatio) => {
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
		pagesAlreadyExtractedForCourse = results.rows.map((row) => parseInt(row.page_number, 10));
	}
	let pageCountExtractedForCourse = 0;
	const pagesAlreadyExtractedForCourseByPageNum = Object.create(null);
	for (const pageNumber of pagesAlreadyExtractedForCourse) {
		pagesAlreadyExtractedForCourseByPageNum[pageNumber] = true;
		pageCountExtractedForCourse++;
	}
	for (const pageNumber of pages) {
		if (!pagesAlreadyExtractedForCourseByPageNum[pageNumber]) {
			pageCountExtractedForCourse++;
		}
	}

	const allowedPageCount = Math.ceil(asset.copyable_page_count * allowedCopyRatio);

	return pageCountExtractedForCourse <= allowedPageCount;
};
