const ensure = require("#tvf-ensure");

/**
 * Get all assets on the plaform for cla admins only
 */
module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();
	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	let limit;
	let offset;
	if (params.hasOwnProperty("limit")) {
		ensure.positiveInteger(ctx, params.limit, "Limit");
		limit = params.limit;
	} else {
		limit = 10;
	}

	if (params.hasOwnProperty("offset")) {
		ensure.nonNegativeInteger(ctx, params.offset, "Offset");
		offset = params.offset;
	} else {
		offset = 0;
	}

	ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");

	const columns = Object.create(null);

	columns.identifier = true;
	columns.title = true;
	columns.publisher_name_log = true;

	// Ensure that the sort field is a valid column name
	if (!columns[params.sort_field]) {
		ctx.throw(400, "Sort field not found");
	}

	let unfilteredCount, sortDirection;

	switch (params.sort_direction.toUpperCase()[0]) {
		case "A":
			sortDirection = "ASC";
			break;
		case "D":
			sortDirection = "DESC";
			break;
		default:
			ctx.throw(400, "Invalid sort direction");
	}

	const whereClauses = [];
	whereClauses.push(`TRUE`);
	const binds = [];
	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		const idx = binds.push(params.query);
		whereClauses.push(`(asset_group.keywords @@ plainto_tsquery($${idx}))`);
	}

	const whereClausesSql = whereClauses.join(" AND ");

	// Count all
	{
		const results = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					asset_group
				WHERE
					${whereClausesSql}
			`,
			binds
		);

		unfilteredCount = parseInt(results.rows[0]._count_, 10);
	}

	const mainQueryBinds = binds.slice(0);
	const limitBindIdx = mainQueryBinds.push(limit);
	const offsetBindIdx = mainQueryBinds.push(offset);
	const query = `
		SELECT
			asset_group.id AS id,
			asset_group.title AS title,
			asset_group.identifier AS identifier,
			asset_group.buy_book_rules AS buy_book_rules,
			asset_group.publisher_name_log AS publisher_name_log,
			CASE WHEN BOOL_AND(asset.active) THEN TRUE WHEN BOOL_AND(NOT asset.active) THEN FALSE ELSE NULL END AS active
		FROM
			asset_group
		LEFT JOIN asset
			ON asset.parent_asset_group_id = asset_group.id
		WHERE
			${whereClausesSql}
		GROUP BY
			asset_group.id
		ORDER BY
			asset_group.${params.sort_field} ${sortDirection},
			asset_group.id ASC
		LIMIT
			$${limitBindIdx}
		OFFSET
			$${offsetBindIdx}
	`;
	const result = await ctx.appDbQuery(query, mainQueryBinds);
	return {
		data: result.rows,
		unfiltered_count: unfilteredCount,
	};
};
