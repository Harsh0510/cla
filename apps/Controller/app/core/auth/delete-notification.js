const ensure = require("#tvf-ensure");
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessData = await ctx.getSessionData();
	const user_id = sessData.user_id;

	const whereClauses = [];
	let whereClausesSql,
		values = [];

	values.push(user_id);
	whereClauses.push(`notification.user_id = $${values.length}`);
	if (params.categoryId) {
		ensure.nonNegativeInteger(ctx, params.categoryId, "Category Id");

		//get categaries which hidable = false
		const getHideableCategories = await ctx.appDbQuery(
			`
				SELECT 
					id 
				FROM
					notification_category
				WHERE
					hideable = false AND
					id = ${params.categoryId}

			`
		);

		if (getHideableCategories.rows && getHideableCategories.rows.length > 0) {
			ctx.throw(400, "Could not update notification for this notification category.");
		}
		values.push(params.categoryId);
		whereClauses.push(`notification.category_id = $${values.length}`);
	} else {
		ensure.validIdentifier(ctx, params.oid, "Identifier");
		values.push(params.oid);
		whereClauses.push(`notification.oid = $${values.length}`);
	}

	whereClausesSql = whereClauses.length ? "WHERE " + whereClauses.join(" and ") : null;

	let result;
	try {
		result = await ctx.appDbQuery(
			`
			DELETE
				FROM
			notification
				${whereClausesSql}
		`,
			values
		);

		if (result.rowCount > 0 && params.categoryId) {
			await ctx.appDbQuery(
				`
				INSERT
					INTO
				user_disabled_notification_categories
					(user_id, category_id)
					VALUES(${user_id}, ${params.categoryId})
					ON CONFLICT (user_id, category_id) DO NOTHING
			`
			);
		}
		return {
			result: result.rowCount > 0,
		};
	} catch (e) {
		ctx.throw(400, "Could not delete notification");
	}
};
