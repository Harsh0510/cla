module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const result = await ctx.appDbQuery(
		`
			SELECT
				screen,
				index
			FROM
				user_flyout_seen
			WHERE
				user_id = $1
		`,
		[sessionData.user_id]
	);

	const ret = {};
	for (const row of result.rows) {
		ret[row.screen] = row.index;
	}
	if (ret["notification"] === undefined) {
		ret["notification"] = -1;
	}

	return {
		data: ret,
	};
};
