/**
 * update extract pages for school
 * @param {*} querier
 * @param {*} assetId
 * @param {*} schoolId
 * @param {*} extractAssetSchoolPages
 */
module.exports = async function (querier, assetId, schoolId, extractAssetSchoolPages) {
	await querier(
		`
			DELETE FROM
				extract_page_by_school
			WHERE
				asset_id = $1
				AND school_id = $2
				AND archive_date IS NULL
		`,
		[assetId, schoolId]
	);

	if (extractAssetSchoolPages.length) {
		const values = [];
		for (const page of extractAssetSchoolPages) {
			values.push(`(${assetId}, ${schoolId}, ${page})`);
		}

		await querier(
			`
				INSERT INTO
					extract_page_by_school
					(asset_id, school_id, page_number)
				VALUES
					${values.join(",")}
				ON CONFLICT DO NOTHING
			`
		);
	}
};
