const ensure = require("#tvf-ensure");
const notificationLimit = require("../../common/notificationLimitCounter");
module.exports = async function (params, ctx) {
	ctx.doNotUpdateSessionExpiry = true;

	//endusre user is logged in
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const user_id = sessionData.user_id;

	const notificationCount = await ctx.appDbQuery(
		`
			SELECT
				COUNT(*) as unreadNotification
			FROM
				notification
			WHERE user_id = ${user_id} AND has_read = false
		`
	);
	const unread_count = parseInt(notificationCount.rows[0].unreadnotification, 10);

	const highPriorityNotification = await ctx.appDbQuery(
		`
			SELECT
				COUNT(*) as highprioritynotification
			FROM
				notification
			WHERE user_id = ${user_id} AND high_priority = true AND has_read = false
		`
	);
	const high_priority_count = parseInt(highPriorityNotification.rows[0].highprioritynotification, 10);
	if (params.getCount) {
		return {
			unread_count: unread_count,
			high_priority_count: high_priority_count,
		};
	}

	let limitCounter = `LIMIT ${notificationLimit.limit}`,
		offsetQuery = "",
		sort_direction = "DESC",
		sort_field,
		whereClauses = [],
		binds = [];

	if (params.hasOwnProperty("limit")) {
		ensure.nonNegativeInteger(ctx, params.limit, "Limit");
		limitCounter = `LIMIT ${params.limit}`;
	}

	if (params.hasOwnProperty("offset")) {
		ensure.nonNegativeInteger(ctx, params.offset, "Offset");
		offsetQuery = `OFFSET ${params.offset}`;
	}

	if (params.hasOwnProperty("sort_direction")) {
		switch (params.sort_direction.toUpperCase()[0]) {
			case "A":
				sort_direction = "ASC";
				break;
			case "D":
				sort_direction = "DESC";
				break;
			default:
				ctx.throw(400, "Invalid sort direction");
		}
	}

	const sortFields = Object.create(null);
	sortFields.title = `notification.title`;
	sortFields.date_created = `notification.date_created`;
	sortFields.description = `notification.description`;

	if (params.hasOwnProperty("sort_field") && !sortFields[params.sort_field]) {
		ctx.throw(400, "Sort field not found");
	}

	if (params.hasOwnProperty("query") && params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		const idx = binds.push(params.query);
		whereClauses.push(`(notification.keywords @@ plainto_tsquery($${idx}))`);
	}

	//Filter Params
	const activeFilters = Object.create(null);
	const filterRequest = {};
	if (params.filter) {
		ctx.assert(typeof params.filter === "object", 400, "Invalid filter provided");
		ctx.assert(!Array.isArray(params.filter), 400, "Invalid filter provided");

		if (params.filter.hasOwnProperty("status")) {
			ctx.assert(Array.isArray(params.filter.status), 400, "Invalid Status provided");
			activeFilters.status = params.filter.status;
		}
		Object.assign(filterRequest, params.filter);
	}

	//add filter for status
	if (activeFilters.status) {
		const statusValues = [];
		//const available_statuses = allStatus();

		for (const status of activeFilters.status) {
			switch (status) {
				case "0":
					statusValues.push(false);
					break;
				case "1":
					statusValues.push(true);
					break;
				default:
					ctx.throw(400, "Invalid Status");
			}
		}
		if (statusValues.length > 0) {
			whereClauses.push(`( notification.has_read IN (${statusValues.join(`,`)}))`);
		}
	}

	whereClauses.push(`notification.user_id = ${user_id}`);
	let whereClausesSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

	sort_field = params.sort_field ? `${params.sort_field}` : "date_created";

	const result = await ctx.appDbQuery(
		`
			SELECT
				has_read,
				date_created,
				title,
				subtitle,
				category_id,
				oid,
				link,
				description,
				hideable_log,
				high_priority,
				(SELECT COUNT(*) as notifcount FROM notification ${whereClausesSql})
			FROM
				notification ${whereClausesSql}
			ORDER BY ${sort_field} ${sort_direction}, id  ${sort_direction}
				${limitCounter}
				${offsetQuery}
		`,
		binds
	);
	return {
		data: result.rows,
		unread_count: unread_count,
		high_priority_count: high_priority_count,
		totalNotificationCount: result.rows.length ? parseInt(result.rows[0].notifcount, 10) : 0,
	};
};
