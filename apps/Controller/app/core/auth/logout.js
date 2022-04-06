const hwbEnv = require("./oauth/hwb/common/env");

module.exports = async function logout(params, ctx) {
	const sessionData = await ctx.getSessionData();
	let redirectUrl = null;
	if (sessionData && sessionData.logged_in_with_hwb) {
		redirectUrl = hwbEnv.logoutEndpoint;
	}
	ctx.clearSessId();
	return {
		redirectUrl: redirectUrl,
	};
};
