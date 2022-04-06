const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
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

	const sortableColumns = Object.create(null);
	sortableColumns.id = `id`;
	sortableColumns.name = `name`;
	sortableColumns.status = `status`;
	sortableColumns.target_execution_date = `target_execution_date`;

	// Ensure that the sort field is a valid column name
	if (!sortableColumns[params.sort_field]) {
		ctx.throw(400, "Sort field not found");
	}
	const sortField = sortableColumns[params.sort_field];

	let sortDirection = "ASC";
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

		if (params.filter.hasOwnProperty("date_created_begin")) {
			// should be unix timestamp (seconds since epoch, not ms)
			ensure.nonNegativeInteger(ctx, params.filter.date_created_begin, "Date created (from)");
			activeFilters.date_created_begin = params.filter.date_created_begin;
		}

		if (params.filter.hasOwnProperty("date_created_end")) {
			// should be unix timestamp (seconds since epoch, not ms)
			ensure.nonNegativeInteger(ctx, params.filter.date_created_end, "Date created (to)");
			activeFilters.date_created_end = params.filter.date_created_end;
		}

		Object.assign(filterRequest, params.filter);
	}

	//Check filter request length for cla-admin
	if (Object.keys(filterRequest).length > 3) {
		ctx.throw(400, `Too many filters provided`);
	}

	const binds = [];
	const whereClauses = [];
	whereClauses.push(`TRUE`);

	if (activeFilters.status) {
		ctx.assert(Array.isArray(activeFilters.status), 400, "status must be an array");
		for (const status of activeFilters.status) {
			ensure.nonEmptyStr(ctx, status, "Status");
		}
		if (activeFilters.status.length > 0) {
			const inParams = [];
			for (const val of activeFilters.status) {
				inParams.push("$" + binds.push(val));
			}
			whereClauses.push(`(rollover_job.status IN (${inParams.join(`, `)}))`);
		}
	}

	if (activeFilters.date_created_begin) {
		// date_created_begin is a timestamp
		whereClauses.push(`(rollover_job.target_execution_date >= TO_TIMESTAMP(${activeFilters.date_created_begin}))`);
	}

	if (activeFilters.date_created_end) {
		// date_created_end is a timestamp
		whereClauses.push(`(rollover_job.target_execution_date <= TO_TIMESTAMP(${activeFilters.date_created_end}))`);
	}

	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		whereClauses.push(`(rollover_job.keywords @@ plainto_tsquery($${binds.push(params.query)}))`);
	}

	const whereClausesSql = whereClauses.join(" AND ");

	const count = await ctx.appDbQuery(
		`
			SELECT
				COUNT (*) AS _count_
			FROM
				rollover_job
			WHERE
				${whereClausesSql}
		`,
		binds
	);

	const unfilteredCount = parseInt(count.rows[0]._count_, 10);

	if (!unfilteredCount) {
		return {
			data: [],
			unfiltered_count: 0,
		};
	}

	const result = await ctx.appDbQuery(
		`
			SELECT
				rollover_job.id AS id,
				rollover_job.name AS name,
				rollover_job.date_created AS date_created,
				rollover_job.target_execution_date AS target_execution_date,
				rollover_job.status AS status,
				rollover_job.next_execution_date AS next_execution_date,
				(
					CASE WHEN
						MIN(school.id) IS NULL
					THEN
						'[]'::jsonb
					ELSE
						JSONB_AGG(school.id)
					END
				) AS rollover_job_school_ids
			FROM
				rollover_job
			LEFT JOIN school
				ON rollover_job.id = school.rollover_job_id
			WHERE
				${whereClausesSql}
			GROUP BY
				rollover_job.id
			ORDER BY
				${sortField} ${sortDirection},
				rollover_job.target_execution_date DESC,
				rollover_job.id ASC
			OFFSET
				${offset}
			LIMIT
				${limit}
		`,
		binds
	);
	return {
		data: result.rows,
		unfiltered_count: unfilteredCount,
	};
};
