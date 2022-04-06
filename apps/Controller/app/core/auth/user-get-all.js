const ensure = require("#tvf-ensure");

const getRolesByUserRole = require("../../common/getRolesByUserRole");

const allStatus = require("../../common/getAllStatuses");

const pendingStatuses = Object.create(null);
pendingStatuses.all = true;
pendingStatuses.only_pending = true;
pendingStatuses.only_approved = true;

const statusByName = allStatus.statusByName;
const statusById = allStatus.statusById;

/**
 * Get all users from a school or the whole platform
 */
module.exports = async function (params, ctx) {
	ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");

	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();

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

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	let unfilteredCount, sortDirection;
	const sortFields = Object.create(null);

	sortFields.title = `cla_user.title`;
	sortFields.first_name = `cla_user.first_name`;
	sortFields.last_name = `cla_user.last_name`;
	sortFields.email = `cla_user.email`;
	sortFields.role = `cla_user.role`;
	sortFields.status = `(case cla_user.status when 'approved' then 1 when 'pending' then 2  when 'registered' then 3 when 'unverified' then 4 END)`;
	sortFields.date = `cla_user.date_last_registration_activity`;

	if (userRole === "cla-admin") {
		sortFields.date_created = `cla_user.date_created`;
		sortFields.school = `school.name`;
		sortFields.school_id = `school.id`;
		sortFields.id = `cla_user.id`;
	}

	// Ensure that the sort field is a valid column name
	if (!sortFields[params.sort_field]) {
		ctx.throw(400, "Sort field not found");
	}

	const sortField = sortFields[params.sort_field];

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

	let pendingStatus;
	if (params.pending_status) {
		pendingStatus = params.pending_status;
	} else {
		if (userRole === "cla-admin") {
			pendingStatus = "all";
		} else {
			pendingStatus = "only_approved";
		}
	}
	ctx.assert(pendingStatuses[pendingStatus], 400, "Unknown pending status");

	//Filter Params
	const activeFilters = Object.create(null);
	const filterRequest = {};

	if (params.filter) {
		ctx.assert(typeof params.filter === "object", 400, "Invalid filter provided");
		ctx.assert(!Array.isArray(params.filter), 400, "Invalid filter provided");

		if (params.filter.hasOwnProperty("roles")) {
			ctx.assert(Array.isArray(params.filter.roles), 400, "Invalid roles provided");
			activeFilters.roles = params.filter.roles;
		}

		if (params.filter.hasOwnProperty("schools") && userRole === "cla-admin") {
			ctx.assert(Array.isArray(params.filter.schools), 400, "Invalid schools provided");
			activeFilters.schools = params.filter.schools;
		}

		if (params.filter.hasOwnProperty("status")) {
			ctx.assert(Array.isArray(params.filter.status), 400, "Invalid Status provided");
			activeFilters.status = params.filter.status;
			// Check for Status Filter Validity
			for (const status of activeFilters.status) {
				ctx.assert(statusByName[status], 400, "Invalid Status provided");
			}
		}
		Object.assign(filterRequest, params.filter);
	}

	//Check filter request length for cla-admin
	if (Object.keys(filterRequest).length > 3 && userRole === "cla-admin") {
		ctx.throw(400, `Too many filters provided`);
	}

	//Check filter request length for school-admin/teacher
	if (Object.keys(filterRequest).length > 2 && userRole === "school-admin") {
		ctx.throw(400, `Too many filters provided`);
	}

	//query parameters
	const values = [];
	const whereClauses = [];
	let whereClausesSql;

	//add filter for exam board
	if (activeFilters.roles) {
		const rolesValues = [];
		let acceptedRole = getRolesByUserRole(userRole);

		for (const role of activeFilters.roles) {
			ctx.assert(
				acceptedRole.find((row) => row.id === role),
				400,
				"User role not found"
			);
			ensure.nonEmptyStr(ctx, role, "User role");
			rolesValues.push(role);
		}
		if (rolesValues.length > 0) {
			whereClauses.push(`( cla_user.role IN ('${rolesValues.join(`', '`)}'))`);
		}
	}

	//add filter for schools
	if (activeFilters.schools) {
		const schoolValues = [];
		for (const school of activeFilters.schools) {
			ensure.positiveInteger(ctx, school, "Institution id");
			schoolValues.push(school);
		}
		if (schoolValues.length > 0) {
			whereClauses.push(`(cla_user.school_id IN (${schoolValues.join(", ")}))`);
		}
	}

	//add filter for status
	if (activeFilters.status) {
		const statusValues = [];
		//const available_statuses = allStatus();

		for (const status of activeFilters.status) {
			statusValues.push(status);
		}
		if (statusValues.length > 0) {
			whereClauses.push(`( cla_user.status IN ('${statusValues.join(`', '`)}'))`);
		}
	}

	// Get all users if cla-admin and Institution users if school-admin
	if (userRole === "cla-admin") {
		whereClauses.push(`TRUE`);
	} else {
		values.push(sessionData.school_id);
		whereClauses.push(`(cla_user.school_id = $${values.length})`);
	}
	switch (pendingStatus) {
		case "only_approved": {
			whereClauses.push(`(cla_user.password_hash IS NOT NULL)`);
			break;
		}
		case "only_pending": {
			whereClauses.push(`(cla_user.status <> 'registered')`);
			break;
		}
	}

	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		const idx = values.push(params.query);
		const keywordsField = userRole === "cla-admin" ? "admin_keywords" : "keywords";
		whereClauses.push(`(cla_user.${keywordsField} @@ plainto_tsquery($${idx}))`);
	}

	//final where Clauses
	whereClausesSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

	// Count all user
	try {
		const results = await ctx.appDbQuery(
			`
				SELECT
					COUNT(*) AS _count_
				FROM
					cla_user
					LEFT JOIN school
						ON cla_user.school_id = school.id
				${whereClausesSql}
			`,
			values
		);

		if (Array.isArray(results.rows) && results.rows.length) {
			unfilteredCount = parseInt(results.rows[0]._count_, 10);
		}
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}

	// Get all user information
	try {
		values.push(limit);
		const limitClause = `$${values.length}`;

		values.push(offset);
		const offsetClause = `$${values.length}`;

		const query = `
			SELECT
				school.id AS school_id,
				school.name AS school_name,
				cla_user.title AS title,
				cla_user.first_name AS first_name,
				cla_user.last_name AS last_name,
				cla_user.email AS email,
				cla_user.is_pending_approval AS is_pending_approval,
				cla_user.role AS role,
				cla_user.trusted_domain_registered_with IS NOT NULL AS trusted_domain,
				cla_user.date_last_registration_activity AS date,
				${userRole === "cla-admin" ? "cla_user.date_created AS date_created, cla_user.id AS id," : ""}
				cla_user.status,
				cla_user.password_hash IS NOT NULL AS is_password_set,
				cla_user.wonde_identifier IS NULL AS can_edit_blocked_fields
			FROM
				cla_user
			LEFT JOIN school
				ON cla_user.school_id = school.id
			${whereClausesSql}
			ORDER BY
				${sortField} ${sortDirection},
				cla_user.id ASC
			LIMIT
				${limitClause}
			OFFSET
				${offsetClause}
		`;
		const result = await ctx.appDbQuery(query, values);
		return {
			data: result.rows,
			unfiltered_count: unfilteredCount,
		};
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}
};
