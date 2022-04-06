module.exports = async function (params, ctx, asyncRunner) {
	const userRole = await ctx.getUserRole();

	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	const ret = await asyncRunner.forceTick();

	return {
		found_task: ret,
	};
};
