const getRolesByUserRole = require("../../common/getRolesByUserRole");
const getAllAvailableStatus = require("../../common/getAllStatuses");

let allStatuses = getAllAvailableStatus.listStatusArr;
module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();

	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin", 401, "Unauthorized");

	const result = [];
	//Filter all Status to Remove registered status from it as we are not filter users by registered status in user-approval
	allStatuses = allStatuses.filter((stat) => stat.id !== "registered");

	try {
		//push user role data based on userRole in result
		let acceptedRole = getRolesByUserRole(userRole);

		if (acceptedRole && acceptedRole.length >= 1) {
			result.push({
				id: "roles",
				title: "Roles",
				data: acceptedRole.map((row) => ({ id: row.id, title: row.name })),
			});
			result.push({
				id: "status",
				title: "Status",
				data: allStatuses.map((status) => ({ id: status.id, title: status.name })),
			});
		}

		//get institutions for only cla-admin user
		if (userRole === "cla-admin") {
			// get institutions
			let schoolData = [];
			if (params.filter_schools) {
				const resultSchools = await ctx.appDbQuery(
					`
						SELECT
							id,
							name AS title
						FROM
							school
						WHERE
							id IN (${params.filter_schools})
						ORDER BY
							name ASC
					`
				);
				if (Array.isArray(resultSchools.rows) && resultSchools.rows.length) {
					schoolData = resultSchools.rows;
				}
			}
			result.push({
				id: "schools",
				title: "Institutions",
				data: schoolData,
			});
		}
		return {
			result: result,
		};
	} catch (e) {
		ctx.throw("500", "An unexpected error has occurred");
	}
};
