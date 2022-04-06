const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	const sessionData = await ctx.getSessionData();
	const schoolId = sessionData.school_id;
	const whereClauses = [];
	const bindData = [];
	let bindIdx = 0;

	if (params.hasOwnProperty("pdf_isbn13")) {
		ensure.validAssetIdentifier(ctx, params.pdf_isbn13, "ISBN");
		bindIdx = bindData.push(params.pdf_isbn13);
		whereClauses.push(`(asset.pdf_isbn13 = $${bindIdx})`);
	}
	bindIdx = bindData.push(schoolId);
	whereClauses.push(`(asset_school_info.school_id = $${bindIdx})`);

	const results = await ctx.appDbQuery(
		`
			SELECT
				asset_school_info.expiration_date,
				asset.pdf_isbn13,
				asset.title
			FROM
				asset_school_info
				LEFT JOIN asset
					ON asset_school_info.asset_id = asset.id
			WHERE
				${whereClauses.join(` AND `)}
				AND asset_school_info.expiration_date IS NOT NULL
				AND asset_school_info.expiration_date >= NOW()
			ORDER BY
				asset_school_info.expiration_date ASC
			LIMIT 10
		`,
		bindData
	);
	return {
		result: results.rows,
	};
};
