const ensure = require("#tvf-ensure");
const { ensureCanCopy } = require("../auth/common/canCopy");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();
	ctx.assert(userRole === "teacher" || userRole === "school-admin", 401, "Unauthorized");

	ensure.nonEmptyStr(ctx, params.title, "Title");
	ensure.validIdentifier(ctx, params.extract_oid, "Extract Oid");

	await ensureCanCopy(ctx);

	const result = await ctx.appDbQuery(
		`
			UPDATE
				extract
			SET
				title = $1,
				modified_by_user_id = $3,
				date_edited = NOW()
			WHERE
				oid = $2
				AND user_id = $3
				AND archive_date IS NULL
			RETURNING
				id
		`,
		[params.title, params.extract_oid, sessionData.user_id]
	);
	ctx.assert(result.rowCount > 0, 400, "Extract not found");
	return {
		result: true,
	};
};
