const userCreate = require("./common/userCreate");

module.exports = async function (params, ctx, sendEmail) {
	ctx.assert(Array.isArray(params.items), 400, "Must provide at least one user");
	ctx.assert(params.items.length > 0, 400, "Must provide at least one user");
	ctx.assert(params.items.length <= 1000, 400, "Cannot upload more than 1000 users at a time - please try with fewer rows");

	const userRole = await ctx.getUserRole();

	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	const results = [];
	for (const userDetails of params.items) {
		const result = {
			success: true,
		};
		try {
			await userCreate(userDetails, ctx, sendEmail);
		} catch (e) {
			result.success = false;
			if (e.status >= 400 && e.status < 500) {
				result.message = e.message;
				result.httpCode = e.status;
			}
		}
		results.push(result);
	}
	return {
		results: results,
	};
};
