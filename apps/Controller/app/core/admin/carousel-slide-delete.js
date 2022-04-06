/**
 * Delete carousel slide on the basis of id.
 */
const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	ensure.nonNegativeInteger(ctx, params.id, "ID");
	const userRole = await ctx.getUserRole();
	// Throw an error if non cla admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");
	const results = await ctx.appDbQuery(`DELETE FROM carousel_slide WHERE id = $1`, [params.id]);
	return {
		result: results.rowCount >= 1,
	};
};
