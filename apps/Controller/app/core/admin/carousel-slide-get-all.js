const ensure = require("#tvf-ensure");

/**
 * Fetch all classes created for a particular institution
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

	const sortableColumns = Object.create(null);
	sortableColumns.name = `name`;
	sortableColumns.sort_order = `sort_order`;
	sortableColumns.enabled = `enabled`;

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

	let queryValues = [];

	const limitBindIdx = queryValues.push(limit);
	const offsetBindIdx = queryValues.push(offset);

	const count = await ctx.appDbQuery(
		`
			SELECT
				COUNT (*) AS _count_
			FROM
				carousel_slide
		`
	);

	const unfilteredCount = parseInt(count.rows[0]._count_, 10);

	const result = await ctx.appDbQuery(
		`
			SELECT
				id AS id,
				name AS name,
				enabled AS enabled,
				sort_order AS sort_order,
				image_url AS image_url,
				image_alt_text AS image_alt_text,
				link_url AS link_url
			FROM
				carousel_slide
			ORDER BY
				${sortField} ${sortDirection},
				date_edited ASC,
				id ASC
			LIMIT
				$${limitBindIdx}
			OFFSET
				$${offsetBindIdx}
		`,
		queryValues
	);
	return {
		data: result.rows,
		unfilteredCount: unfilteredCount,
	};
};
