const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");

	let limit, offset, sortDirection;

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

	columns.domain = `trusted_domain.domain`;

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
		whereClauses = `WHERE (trusted_domain.keywords @@ plainto_tsquery($${idx})) `;
	}
	// Count all
	const results = await ctx.appDbQuery(
		`
			SELECT
				COUNT(*) AS _count_
			FROM
				trusted_domain
			${whereClauses}
		`,
		binds
	);

	const unfilteredCount = parseInt(results.rows[0]._count_, 10);

	const mainQueryBinds = binds.slice(0);
	const limitBindIdx = mainQueryBinds.push(limit);
	const offsetBindIdx = mainQueryBinds.push(offset);

	const query = `
		SELECT
			trusted_domain.id AS id,
			trusted_domain.domain AS domain
		FROM
			trusted_domain
		${whereClauses}
		ORDER BY
			${sortField} ${sortDirection},
			trusted_domain.id ASC
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
