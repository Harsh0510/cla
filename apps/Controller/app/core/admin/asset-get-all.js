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

	columns.isbn13 = true;
	columns.pdf_isbn13 = true;
	columns.title = true;
	columns.publisher_name_log = true;
	columns.active = true;

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
	whereClauses.push("asset.is_ep");
	const binds = [];
	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		const idx = binds.push(params.query);
		whereClauses.push(`(asset.weighted_tsv @@ plainto_tsquery($${idx}))`);
	}

	const whereClausesSql = whereClauses.join(" AND ");

	// Count all
	{
		const results = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					asset
				WHERE
					${whereClausesSql}
			`,
			binds
		);

		if (Array.isArray(results.rows) && results.rows.length) {
			unfilteredCount = parseInt(results.rows[0]._count_, 10);
		}
	}

	try {
		const mainQueryBinds = binds.slice(0);
		const limitBindIdx = mainQueryBinds.push(limit);
		const offsetBindIdx = mainQueryBinds.push(offset);
		const query = `
			SELECT
				id,
				isbn13,
				pdf_isbn13,
				title,
				publisher_name_log,
				imprint,
				active,
				buy_book_rules
			FROM
				asset
			WHERE
				${whereClausesSql}
			ORDER BY
				${params.sort_field} ${sortDirection},
				asset.id ASC
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
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}
};
