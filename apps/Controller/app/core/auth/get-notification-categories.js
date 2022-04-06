/**
 * Fetch all the notification categories - requires logged in user.
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	const userRole = await ctx.getUserRole();

	const whereClauses = [];
	whereClauses.push("(hideable = TRUE)");
	if (userRole === "teacher") {
		whereClauses.push("(code <> 'awaiting-approval')");
	}

	const result = await ctx.appDbQuery(
		`
			SELECT
				id,
				description_to_enable AS description
			FROM
				notification_category
			WHERE
				${whereClauses.join(" AND ")}
			ORDER BY
				sort_order ASC
		`
	);

	return {
		items: result.rows,
	};
};
