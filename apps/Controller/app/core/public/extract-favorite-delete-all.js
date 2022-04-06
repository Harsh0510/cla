module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	await ctx.appDbQuery(
		`
			DELETE FROM
				extract_user_info
			WHERE
				user_id = $1
		`,
		[sessionData.user_id]
	);
	return {
		success: true,
	};
};
