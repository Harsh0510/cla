const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.nonNegativeInteger(ctx, params.id, "ID");

	const results = await ctx.appDbQuery(`DELETE FROM trusted_domain WHERE id = $1`, [params.id]);

	return {
		result: results.rowCount >= 1,
	};
};
