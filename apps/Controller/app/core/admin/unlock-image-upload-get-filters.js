const unlockImageUploadStatus = require("../../common/unlockImageUploadStatus");
let allStatuses = unlockImageUploadStatus.imageUploadStatus;

module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();

	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	const result = [];

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

	//push unlock Image Upload Status data in result
	result.push({
		id: "status",
		title: "Status",
		data: allStatuses.map((row) => ({ id: row.id, title: row.name })),
	});

	return {
		result: result,
	};
};
