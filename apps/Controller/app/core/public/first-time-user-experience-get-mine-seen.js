const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const user_id = sessionData.user_id;

	ensure.nonEmptyStr(ctx, params.screen, "Screen");

	let result = -1; // -1 means nothing seen, 0 means first flyout/popup seen, etc.
	try {
		const getUserFlyoutScreen = await ctx.appDbQuery(
			`
				SELECT
					index
				FROM user_flyout_seen
				WHERE user_id = $1
				AND screen = $2
			`,
			[user_id, params.screen]
		);

		if (Array.isArray(getUserFlyoutScreen.rows) && getUserFlyoutScreen.rows.length && getUserFlyoutScreen.rows.length > 0) {
			result = getUserFlyoutScreen.rows[0].index;
		}
		return {
			result: result,
		};
	} catch (e) {
		ctx.throw("500", "An unexpected error has occurred");
	}
};
