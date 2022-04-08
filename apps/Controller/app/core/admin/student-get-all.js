const ensure = require("#tvf-ensure");

const cities = require("../../common/cities");

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
	columns.id = true;
	columns.date_created = true;
	columns.first_name = true;
	columns.last_name = true;
	columns.enroll_number = true;
	columns.email = true;
	columns.school_id = true;
	columns.department = true;
	columns.class = true;
	columns.city = true;
	columns.mobile_number = true;
	columns.address = true;

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

	//check with filter Params and add in activeFilters
	const activeFilters = Object.create(null);
	const filterRequest = {};

	if (params.filter) {
		ctx.assert(typeof params.filter === "object", 400, "Invalid filter provided");
		ctx.assert(!Array.isArray(params.filter), 400, "Invalid filter provided");

		if (params.filter.hasOwnProperty("city")) {
			ctx.assert(Array.isArray(params.filter.city), 400, "Invalid city provided");
			activeFilters.city = params.filter.city;
		}

		if (params.filter.hasOwnProperty("schools") && userRole === "cla-admin") {
			ctx.assert(Array.isArray(params.filter.schools), 400, "Invalid institutions provided");
			activeFilters.schools = params.filter.schools;
		}

		Object.assign(filterRequest, params.filter);
	}

	//Check filter request length
	if (Object.keys(filterRequest).length > 4) {
		ctx.throw(400, `Too many filters provided`);
	}

	// if (params.hasOwnProperty("with_rollover_job")) {
	// 	ctx.assert(typeof params.with_rollover_job === "boolean", 400, "with_rollover_job should be a boolean");
	// }

	// if (params.hasOwnProperty("rollover_job_id")) {
	// 	ensure.nonNegativeInteger(ctx, params.rollover_job_id, "rollover_job_id");
	// }

	//query parameters
	let binds = [];
	const whereClauses = [];
	let joins = [];
	// if (params.query) {
	// 	ctx.assert(typeof params.query === "string", 400, "Query invalid");
	// 	const idx = binds.push(params.query);
	// 	whereClauses.push(`(school.keywords @@ plainto_tsquery($${idx}))`);
	// }

	// add filter for city
	if (activeFilters.city) {
		const cityValues = [];
		for (const city of activeFilters.city) {
			ctx.assert(
				cities.find((d) => d.id === city),
				400,
				"City not found"
			);
			cityValues.push(city);
		}
		if (cityValues.length > 0) {
			whereClauses.push(`( student.city IN ('${cityValues.join(`', '`)}'))`);
		}
	}

	//add filter for schools
	// if (activeFilters.schools) {
	// 	const schoolValues = [];
	// 	for (const school of activeFilters.schools) {
	// 		ensure.positiveInteger(ctx, school, "School id");
	// 		schoolValues.push(school);
	// 	}
	// 	if (schoolValues.length > 0) {
	// 		whereClauses.push(`(school.id IN (${schoolValues.join(", ")}))`);
	// 	}
	// }

	const whereClausesSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

	const count = await ctx.appDbQuery(
		`
			SELECT
				COUNT (*) AS _count_
			FROM
				student
			${whereClausesSql}
		`,
		binds
	);

	unfilteredCount = parseInt(count.rows[0]._count_, 10);

	if (!unfilteredCount) {
		return {
			data: [],
			unfiltered_count: 0,
		};
	}

	const result = await ctx.appDbQuery(
		`
			SELECT
				student.id AS id,
				student.first_name AS first_name,
				student.date_created AS date_of_upload,
				student.last_name AS last_name,
				student.enroll_number AS enroll_number,
				student.email AS email,
				student.school_id AS school_id,
				student.department AS department,
				student.class AS class,
				student.city AS city,
				student.mobile_number AS mobile_number,
				student.address AS address
			FROM
				student
			LEFT JOIN school
				ON student.school_id = school.id
					${whereClausesSql}
				ORDER BY
			${params.sort_field} ${sortDirection},
			student.id ASC
		`,
		binds
	);

	// for (const extract of result.rows) {
	// 	if (extract.filename) {
	// 		extract.pdf_url = getExtractUserAssetUrl(extract.filename);
	// 	}
	// }
	return {
		data: result.rows,
		unfiltered_count: unfilteredCount,
	};
};
