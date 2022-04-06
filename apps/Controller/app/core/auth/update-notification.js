const ensure = require("#tvf-ensure");
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	ensure.validIdentifier(ctx, params.oid, "Identifier");
	const sessData = await ctx.getSessionData();
	const user_id = sessData.user_id;

	let result, unread_count, high_priority_count;
	try {
		result = await ctx.appDbQuery(
			`
				UPDATE
					notification
				SET
					has_read = $1
				WHERE
					oid = $2
			`,
			[params.has_read, params.oid]
		);

		const notificationCount = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) as unreadNotification
				FROM
					notification
				WHERE user_id = ${user_id} AND has_read = false
			`
		);
		unread_count = parseInt(notificationCount.rows[0].unreadnotification, 10);

		highPriorityNotification = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) as highprioritynotification
				FROM
					notification
				WHERE user_id = ${user_id} AND high_priority = true AND has_read = false
			`
		);
		high_priority_count = parseInt(highPriorityNotification.rows[0].highprioritynotification, 10);

		return {
			result: result.rowCount > 0,
			unread_count: unread_count,
			high_priority_count: high_priority_count,
		};
	} catch (e) {
		ctx.throw(400, "Could not update notification");
	}
};
