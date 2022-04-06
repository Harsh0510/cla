const territories = require("../../common/territories");
const schoolLevels = require("../../common/school-levels");
const schoolTypes = require("../../common/school-types");

module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();

	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	const result = [];

	//push territories data in result
	result.push({
		id: "territory",
		title: "Territory",
		data: territories.map((row) => ({ id: row.id, title: row.name })),
	});

	//push institution level data in result
	result.push({
		id: "school_level",
		title: "Institution Level",
		data: schoolLevels.map((row) => ({ id: row.id, title: row.name })),
	});

	//push institution type data in result
	result.push({
		id: "school_type",
		title: "Institution Type",
		data: schoolTypes.map((row) => ({ id: row.id, title: row.name })),
	});

	let schoolData = [];
	// get institutions
	if (params.filter_schools) {
		const schools = await ctx.appDbQuery(
			`
				SELECT
					id,
					name AS title
				FROM
					school
				WHERE id IN (${params.filter_schools})
				ORDER BY
					name ASC
			`
		);
		schoolData = schools.rows;
	}
	//push school-data in result
	result.push({
		id: "schools",
		title: "Institutions",
		data: schoolData,
	});

	return {
		result: result,
	};
};
