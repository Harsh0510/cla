const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	ensure.validAssetIdentifier(ctx, params.pdf_isbn13, "pdf_isbn13");
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const result = await ctx.appDbQuery(
		`
			INSERT INTO
				asset_user_info
				(
					asset_id,
					user_id,
					is_favorite
				)
			SELECT
				id,
				$1,
				$2
			FROM
				asset
			WHERE
				pdf_isbn13 = $3
				AND active
				AND is_ep
			ON CONFLICT
				(asset_id, user_id)
			DO UPDATE SET
				is_favorite = EXCLUDED.is_favorite
		`,
		[sessionData.user_id, !!params.is_favorite, params.pdf_isbn13]
	);
	return {
		success: result.rowCount > 0,
	};
};
