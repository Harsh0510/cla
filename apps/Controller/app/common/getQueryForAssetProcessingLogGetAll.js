const ensure = require("#tvf-ensure");

module.exports = (ctx, filter, query) => {
	const activeFilters = Object.create(null);
	const filterRequest = {};

	if (filter) {
		ctx.assert(typeof filter === "object", 400, "Invalid filter provided");
		ctx.assert(!Array.isArray(filter), 400, "Invalid filter provided");

		if (filter.hasOwnProperty("success")) {
			ctx.assert(Array.isArray(filter.success), 400, "Invalid success provided");
			activeFilters.success = filter.success;
		}

		if (filter.hasOwnProperty("stage")) {
			ctx.assert(Array.isArray(filter.stage), 400, "Invalid Stage provided");
			activeFilters.stage = filter.stage;
		}

		if (filter.hasOwnProperty("date_created_begin")) {
			// should be unix timestamp (seconds since epoch, not ms)
			ensure.nonNegativeInteger(ctx, filter.date_created_begin, "Date created (from)");
			activeFilters.date_created_begin = filter.date_created_begin;
		}

		if (filter.hasOwnProperty("date_created_end")) {
			// should be unix timestamp (seconds since epoch, not ms)
			ensure.nonNegativeInteger(ctx, filter.date_created_end, "Date created (to)");
			activeFilters.date_created_end = filter.date_created_end;
		}

		Object.assign(filterRequest, filter);
	}

	//query parameters
	const queryValues = [];
	const whereClauses = [];

	// always filter by high priority items
	whereClauses.push(`(asset_processing_log.high_priority = TRUE)`);

	//add filter for Stage
	if (activeFilters.stage) {
		ctx.assert(Array.isArray(activeFilters.stage), 400, "stage must be an array");
		for (const stage of activeFilters.stage) {
			ensure.nonEmptyStr(ctx, stage, "Stage");
		}
		if (activeFilters.stage.length > 0) {
			const inParams = [];
			for (const val of activeFilters.stage) {
				inParams.push("$" + queryValues.push(val));
			}
			whereClauses.push(`(asset_processing_log.stage IN (${inParams.join(`, `)}))`);
		}
	}

	//add filter for success
	if (activeFilters.success) {
		ctx.assert(Array.isArray(activeFilters.success), 400, "success must be an array");
		for (const success of activeFilters.success) {
			ctx.assert(typeof success === "boolean", 400, "Success should be a boolean");
		}
		if (activeFilters.success.length > 0) {
			whereClauses.push(`( asset_processing_log.success IN (${activeFilters.success.join(`, `)}))`);
		}
	}

	if (activeFilters.date_created_begin) {
		// date_created_begin is a timestamp
		whereClauses.push(`(asset_processing_log.date_created >= TO_TIMESTAMP(${activeFilters.date_created_begin}))`);
	}

	if (activeFilters.date_created_end) {
		// date_created_end is a timestamp
		whereClauses.push(`(asset_processing_log.date_created <= TO_TIMESTAMP(${activeFilters.date_created_end}))`);
	}

	//add filter query param
	if (query) {
		ctx.assert(typeof query === "string", 400, "Query invalid");
		const idx = queryValues.push(query);
		whereClauses.push(`(asset_processing_log.keywords @@ plainto_tsquery($${idx}))`);
	}

	//final where Clauses
	return {
		whereClauses: whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "",
		queryBinds: queryValues,
	};
};
