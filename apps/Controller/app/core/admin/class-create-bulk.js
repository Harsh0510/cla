const ensure = require("#tvf-ensure");
const { classCreate } = require("./lib/classCreate");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	ctx.assert(Array.isArray(params.items), 400, "Must provide at least one class");
	ctx.assert(params.items.length > 0, 400, "Must provide at least one class");
	ctx.assert(params.items.length <= 1000, 400, "Cannot upload more than 1000 classes at a time - please try with fewer rows");

	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;

	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	if (userRole === "cla-admin") {
		ensure.nonNegativeInteger(ctx, params.school_id, "Institution");
	}

	return await classCreate(
		(...args) => ctx.appDbQuery(...args),
		userRole === "cla-admin" ? params.school_id : sessionData.school_id,
		sessionData.user_id,
		params.items
	);
};
