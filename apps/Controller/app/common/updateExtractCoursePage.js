/**
 * update extract pages for course
 * @param {*} querier
 * @param {*} assetId
 * @param {*} courseId
 * @param {*} extractAssetCoursePages
 */
module.exports = async function (querier, assetId, courseId, extractAssetCoursePages) {
	await querier(
		`
			DELETE FROM
				extract_page
			WHERE
				asset_id = $1
				AND course_id = $2
				AND archive_date IS NULL
		`,
		[assetId, courseId]
	);
	if (extractAssetCoursePages.length) {
		const values = [];
		for (const page of extractAssetCoursePages) {
			values.push(`(${assetId}, ${courseId}, ${page})`);
		}

		await querier(
			`
				INSERT INTO
					extract_page
					(asset_id, course_id, page_number)
				VALUES
					${values.join(",")}
				ON CONFLICT DO NOTHING
			`
		);
	}
};
