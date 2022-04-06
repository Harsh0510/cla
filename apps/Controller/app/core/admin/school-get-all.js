const ensure = require("#tvf-ensure");

const territories = require("../../common/territories");
const schoolLevels = require("../../common/school-levels");
const schoolTypes = require("../../common/school-types");

/**
 * Get all schools on the plaform for cla admins only
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
	columns.id = true;
	columns.name = true;
	columns.school_level = true;
	columns.school_type = true;
	columns.number_of_students = true;
	columns.city = true;
	columns.territory = true;
	columns.last_rollover_date = true;

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

		if (params.filter.hasOwnProperty("territory")) {
			ctx.assert(Array.isArray(params.filter.territory), 400, "Invalid territory provided");
			activeFilters.territory = params.filter.territory;
		}
		if (params.filter.hasOwnProperty("school_level")) {
			ctx.assert(Array.isArray(params.filter.school_level), 400, "Invalid institutions level provided");
			activeFilters.school_level = params.filter.school_level;
		}
		if (params.filter.hasOwnProperty("school_type")) {
			ctx.assert(Array.isArray(params.filter.school_type), 400, "Invalid institutions type provided");
			activeFilters.school_type = params.filter.school_type;
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

	if (params.hasOwnProperty("with_rollover_job")) {
		ctx.assert(typeof params.with_rollover_job === "boolean", 400, "with_rollover_job should be a boolean");
	}

	if (params.hasOwnProperty("rollover_job_id")) {
		ensure.nonNegativeInteger(ctx, params.rollover_job_id, "rollover_job_id");
	}

	const whereClauses = [];
	whereClauses.push(`TRUE`);
	const binds = [];
	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		const idx = binds.push(params.query);
		whereClauses.push(`(school.keywords @@ plainto_tsquery($${idx}))`);
	}

	//add filter for territory
	if (activeFilters.territory) {
		const territoryValues = [];
		for (const territory of activeFilters.territory) {
			ctx.assert(
				territories.find((d) => d.id === territory),
				400,
				"Territory not found"
			);
			territoryValues.push(territory);
		}
		if (territoryValues.length > 0) {
			whereClauses.push(`( school.territory IN ('${territoryValues.join(`', '`)}'))`);
		}
	}

	//add filter for school_level
	if (activeFilters.school_level) {
		const schoolLevelValues = [];
		for (const schoolLevel of activeFilters.school_level) {
			ctx.assert(
				schoolLevels.find((d) => d.id === schoolLevel),
				400,
				"School level not found"
			);
			schoolLevelValues.push(schoolLevel);
		}
		if (schoolLevelValues.length > 0) {
			whereClauses.push(`( school.school_level IN ('${schoolLevelValues.join(`', '`)}'))`);
		}
	}

	//add filter for school_type
	if (activeFilters.school_type) {
		const schoolTypeValues = [];
		for (const schoolType of activeFilters.school_type) {
			ctx.assert(
				schoolTypes.find((d) => d.id === schoolType),
				400,
				"School type not found"
			);
			schoolTypeValues.push(schoolType);
		}
		if (schoolTypeValues.length > 0) {
			whereClauses.push(`( school.school_type IN ('${schoolTypeValues.join(`', '`)}'))`);
		}
	}

	//add filter for schools
	if (activeFilters.schools) {
		const schoolValues = [];
		for (const school of activeFilters.schools) {
			ensure.positiveInteger(ctx, school, "School id");
			schoolValues.push(school);
		}
		if (schoolValues.length > 0) {
			whereClauses.push(`(school.id IN (${schoolValues.join(", ")}))`);
		}
	}

	const selectColumns = [];
	const joins = [];
	selectColumns.push("school.id");
	selectColumns.push("school.name");
	selectColumns.push("school.territory");
	selectColumns.push("school.school_level");
	selectColumns.push("school.school_type");

	if (params.hasOwnProperty("with_rollover_job")) {
		const rolloverJobId = params.rollover_job_id || 0;
		let selectSchoolSql = `(school.rollover_job_id = 0 OR school.rollover_job_id = ${rolloverJobId})`;
		if (rolloverJobId > 0) {
			const rolloverJob = await ctx.appDbQuery(
				`
					SELECT
						COUNT(*) AS count
					FROM
						rollover_job
					WHERE
						id = $1
						AND (status = 'scheduled' OR status = 'completed')
			`,
				[rolloverJobId]
			);
			if (!rolloverJob.rows[0].count) {
				selectSchoolSql = `(school.rollover_job_id = ${rolloverJobId})`;
			}
		}
		joins.push("LEFT JOIN rollover_job ON school.rollover_job_id = rollover_job.id");
		selectColumns.push("rollover_job.target_execution_date AS target_execution_date");
		selectColumns.push("school.last_rollover_date AS last_rollover_date");
		whereClauses.push(selectSchoolSql);
	} else {
		selectColumns.push("school.identifier");
		selectColumns.push("school.address1");
		selectColumns.push("school.address2");
		selectColumns.push("school.city");
		selectColumns.push("school.county");
		selectColumns.push("school.post_code");
		selectColumns.push("school.local_authority");
		selectColumns.push("school.school_home_page");
		selectColumns.push("school.number_of_students");
		selectColumns.push("school.wonde_approved");
		selectColumns.push("school.enable_wonde_user_sync");
		selectColumns.push("school.enable_wonde_class_sync");
		selectColumns.push("school.wonde_identifier IS NULL AS can_edit_blocked_fields");
		selectColumns.push("school.gsg");
		selectColumns.push("school.dfe");
		selectColumns.push("school.seed");
		selectColumns.push("school.nide");
		selectColumns.push("school.hwb_identifier");
	}
	const whereClausesSql = whereClauses.join(" AND ");
	const joinsSQL = joins.length ? joins.join(" ") : "";
	// Count all
	{
		const results = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					school
				WHERE
					${whereClausesSql}
			`,
			binds
		);

		if (Array.isArray(results.rows) && results.rows.length) {
			unfilteredCount = parseInt(results.rows[0]._count_, 10);
		}
	}

	const mainQueryBinds = binds.slice(0);
	const limitBindIdx = mainQueryBinds.push(limit);
	const offsetBindIdx = mainQueryBinds.push(offset);
	const selectColumnsString = selectColumns.join(", ");
	const query = `
		SELECT
			${selectColumnsString}
		FROM
			school
			${joinsSQL}
		WHERE
			${whereClausesSql}
		ORDER BY
			${params.sort_field} ${sortDirection},
			school.id ASC
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
