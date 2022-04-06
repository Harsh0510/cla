const ensure = require("#tvf-ensure");
const getQueryForAssetProcessingLogGetAll = require("../../common/getQueryForAssetProcessingLogGetAll");

const sortableColumns = Object.create(null);

sortableColumns.id = `id`;
sortableColumns.date_created = `date_created`;
sortableColumns.stage = `stage`;
sortableColumns.sub_stage = `sub_stage`;
sortableColumns.asset_identifier = `asset_identifier`;
sortableColumns.success = `success`;

/**
 * Get all processing log item
 */
module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	// Throw an error if non cla-admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");

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
	const query = getQueryForAssetProcessingLogGetAll(ctx, params.filter, params.query);

	// Count all rows
	const results = await ctx.appDbQuery(
		`
			SELECT
				COUNT(*) AS _count_
			FROM
				asset_processing_log
			${query.whereClauses}
		`,
		query.queryBinds
	);

	const unfilteredCount = parseInt(results.rows[0]._count_, 10);

	// Get all processing log item information

	const limitClause = `$${query.queryBinds.push(limit)}`;
	const offsetClause = `$${query.queryBinds.push(offset)}`;

	const result = await ctx.appDbQuery(
		`
			SELECT
				id,
				date_created,
				stage,
				sub_stage,
				asset_identifier,
				success,
				content
			FROM
			asset_processing_log
			${query.whereClauses}
			ORDER BY
				${sortField} ${sortDirection},
				id DESC
			LIMIT
				${limitClause}
			OFFSET
				${offsetClause}
		`,
		query.queryBinds
	);
	return {
		data: result.rows,
		unfiltered_count: unfilteredCount,
	};
};
