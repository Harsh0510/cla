const ensure = require("#tvf-ensure");

/**
 * Get all Imprints on the plaform for cla admins only
 */
module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non cla-admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");

	let limit, offset, unfilteredCount, sortDirection;

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

	const columns = Object.create(null);
	columns.name = `imprint.name`;
	columns.publisher_name_log = `imprint.publisher_name_log`;
	columns.external_identifier = `imprint.external_identifier`;

	// Ensure that the sort field is a valid column name
	if (!columns[params.sort_field]) {
		ctx.throw(400, "Sort field not found");
	}

	const sortField = columns[params.sort_field];

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

	let whereClauses = "";
	const binds = [];
	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		const idx = binds.push(params.query);
		whereClauses = `WHERE (imprint.keywords @@ plainto_tsquery($${idx})) `;
	}
	// Count all
	try {
		const results = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					imprint
				${whereClauses}
			`,
			binds
		);

		if (Array.isArray(results.rows) && results.rows.length) {
			unfilteredCount = parseInt(results.rows[0]._count_, 10);
		}
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}

	try {
		const mainQueryBinds = binds.slice(0);
		const limitBindIdx = mainQueryBinds.push(limit);
		const offsetBindIdx = mainQueryBinds.push(offset);

		const query = `
			SELECT
				imprint.id AS id,
				imprint.name AS name,
				imprint.external_identifier AS external_identifier,
				imprint.publisher_name_log AS publisher_name_log,
				imprint.buy_book_rules AS buy_book_rules
			FROM
				imprint
				${whereClauses}
			ORDER BY
				${sortField} ${sortDirection},
				imprint.id ASC
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
