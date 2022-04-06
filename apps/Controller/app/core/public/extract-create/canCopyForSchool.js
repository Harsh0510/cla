module.exports = async (querier, schoolId, asset, pages, allowedCopyRatio) => {
	let pagesAlreadyExtractedForSchool = [];
	{
		const results = await querier(
			`
				SELECT
					page_number
				FROM
					extract_page_by_school
				WHERE
					school_id = $1
					AND asset_id = $2
					AND archive_date IS NULL
			`,
			[schoolId, asset.id]
		);
		pagesAlreadyExtractedForSchool = results.rows.map((row) => parseInt(row.page_number, 10));
	}
	let pageCountExtractedForSchool = 0;
	const pagesAlreadyExtractedForSchoolByPageNum = Object.create(null);
	for (const pageNumber of pagesAlreadyExtractedForSchool) {
		pagesAlreadyExtractedForSchoolByPageNum[pageNumber] = true;
		pageCountExtractedForSchool++;
	}
	for (const pageNumber of pages) {
		if (!pagesAlreadyExtractedForSchoolByPageNum[pageNumber]) {
			pageCountExtractedForSchool++;
		}
	}

	return pageCountExtractedForSchool <= Math.ceil(asset.copyable_page_count * allowedCopyRatio);
};
