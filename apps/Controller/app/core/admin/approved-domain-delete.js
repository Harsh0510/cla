const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.nonNegativeInteger(ctx, params.id, "ID");

	let results;
	try {
		results = await ctx.appDbQuery(`DELETE FROM approved_domain WHERE id = $1`, [params.id]);
	} catch (e) {
		ctx.throw(400, "Could not delete approved domain");
	}

	return {
		result: results.rowCount >= 1,
	};
};
