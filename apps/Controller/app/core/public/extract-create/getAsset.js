const isUnlockedSql = require("../../../common/isUnlockedSql");

module.exports = async (querier, pdfIsbn13, schoolId) => {
	const result = await querier(
		`
			SELECT
				asset.id AS id,
				asset.page_count AS page_count,
				asset.copyable_page_count AS copyable_page_count,
				asset.title AS title,
				asset.copy_excluded_pages AS copy_excluded_pages,
				asset_school_info.expiration_date AS expiration_date
			FROM
				asset
			LEFT JOIN asset_school_info
				ON asset.id = asset_school_info.asset_id
				AND asset_school_info.school_id = $2
			WHERE
				asset.pdf_isbn13 = $1
				AND asset.active
				AND asset.is_ep
				AND ${isUnlockedSql(true)} = TRUE
		`,
		[pdfIsbn13, schoolId]
	);
	if (!result.rowCount) {
		return null;
	}
	const c = result.rows[0];
	c.id = parseInt(c.id, 10);
	c.page_count = parseInt(c.page_count, 10);
	c.copyable_page_count = parseInt(c.copyable_page_count, 10);
	return c;
};
