/**
 * Fetch a user's disabled notification categories (assuming they're logged in - i.e. have a non-empty session).
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessData = await ctx.getSessionData();

	const result = await ctx.appDbQuery(
		`
			SELECT
				user_disabled_notification_categories.category_id AS id
			FROM
				user_disabled_notification_categories
			WHERE
				user_disabled_notification_categories.user_id = $1
		`,
		[sessData.user_id]
	);

	return {
		items: result.rows.map((v) => parseInt(v.id, 10)),
	};
};
