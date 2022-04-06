const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	ensure.validIdentifier(ctx, params.oid, "oid");
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	ctx.assert(sessionData.school_id > 0, 401, "Must be associated with a school");
	const result = await ctx.appDbQuery(
		`
			INSERT INTO
				extract_user_info
				(
					extract_id,
					user_id,
					is_favorite
				)
			SELECT
				id,
				$1,
				$2
			FROM
				extract
			WHERE
				oid = $3
				AND school_id = $4
				AND archive_date IS NULL
			ON CONFLICT
				(extract_id, user_id)
			DO UPDATE SET
				is_favorite = EXCLUDED.is_favorite
		`,
		[sessionData.user_id, !!params.is_favorite, params.oid, sessionData.school_id]
	);
	return {
		success: result.rowCount > 0,
	};
};
