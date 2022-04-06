const ensure = require("#tvf-ensure");

const territories = require("../../common/territories");
const schoolLevels = require("../../common/school-levels");
const schoolTypes = require("../../common/school-types");

/**
 * get schoolIds based on school filter
 * @param {*} params
 * @param {*} ctx
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const userRole = await ctx.getUserRole();
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	let allSelectedSchoolIds = [];

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
			ctx.assert(Array.isArray(params.filter.school_level), 400, "Invalid institution level provided");
			activeFilters.school_level = params.filter.school_level;
		}
		if (params.filter.hasOwnProperty("school_type")) {
			ctx.assert(Array.isArray(params.filter.school_type), 400, "Invalid institution type provided");
			activeFilters.school_type = params.filter.school_type;
		}

		if (params.filter.hasOwnProperty("schools")) {
			ctx.assert(Array.isArray(params.filter.schools), 400, "Invalid institutions provided");
			activeFilters.schools = params.filter.schools;
		}

		Object.assign(filterRequest, params.filter);
	}

	//Check filter request length
	if (Object.keys(filterRequest).length > 4) {
		ctx.throw(400, `Too many filters provided`);
	}

	const whereClauses = [];

	if (params.rollover_job_id) {
		whereClauses.push(`(school.rollover_job_id = 0 OR school.rollover_job_id = ${params.rollover_job_id})`);
	} else {
		whereClauses.push(`(school.rollover_job_id = 0)`);
	}
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
			ensure.positiveInteger(ctx, school, "Institution id");
			schoolValues.push(school);
		}
		if (schoolValues.length > 0) {
			whereClauses.push(`(school.id IN (${schoolValues.join(", ")}))`);
		}
	}

	const whereClausesSql = whereClauses.join(" AND ");
	const results = await ctx.appDbQuery(
		`
				SELECT
					id
				FROM
					school
				WHERE
					${whereClausesSql}
				ORDER BY
					id ASC
			`,
		binds
	);
	for (const row of results.rows) {
		allSelectedSchoolIds.push(row.id);
	}

	return allSelectedSchoolIds;
};
