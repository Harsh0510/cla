const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const user_id = sessionData.user_id;

	ensure.nonEmptyStr(ctx, params.screen, "Screen");
	ensure.nonNegativeInteger(ctx, params.index, "Index");

	await ctx.appDbQuery(
		`
			INSERT INTO user_flyout_seen
			(
				user_id,
				screen,
				index
			)
			VALUES
			(
				$1,
				$2,
				$3
			)
			ON CONFLICT (user_id, screen) DO UPDATE SET index = $3
		`,
		[user_id, params.screen, params.index]
	);
	return {
		result: true,
	};
};
