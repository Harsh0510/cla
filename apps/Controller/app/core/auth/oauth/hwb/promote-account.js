const promoteToRealAccount = require("./common/promoteToRealAccount");

module.exports = async (app, asyncRunner) => {
	app.route("/auth/oauth/hwb/promote-account", async (params, ctx) => {
		const sessionData = await ctx.getSessionData();
		ctx.assert(sessionData && sessionData.user_id > 0, 401, "Unauthorized");
		await promoteToRealAccount(ctx.appDbQuery.bind(ctx), sessionData.user_id);
		return {};
	});
};
