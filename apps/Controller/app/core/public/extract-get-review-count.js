module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	const sessionData = await ctx.getSessionData();
	const user_id = sessionData.user_id;

	const result = await ctx.appDbQuery(
		`
			SELECT
				COUNT(*) AS _count_
			FROM
				extract
			WHERE
				user_id = $1
				AND date_expired < NOW()
				AND archive_date IS NULL
				AND parent_id <> 0
		`,
		[user_id]
	);

	return {
		count: parseInt(result.rows[0]._count_, 10),
	};
};
