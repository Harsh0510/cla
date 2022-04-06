const examBoards = require("../../common/examBoards");
const keyStages = require("../../common/keyStages");

module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();

	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin" || userRole === "teacher", 401, "Unauthorized");

	const result = [];

	try {
		//push exam_board data in result
		result.push({
			id: "exam_board",
			title: "Exam Board",
			data: examBoards.list.map((row) => ({ id: row, title: row })),
		});

		//push exam_board data in result
		result.push({
			id: "key_stage",
			title: "Key Stage",
			data: keyStages.map((row) => ({ id: row, title: row })),
		});

		//get institutions for only cla-admin user
		if (userRole === "cla-admin") {
			let schoolData = [];
			if (params.filter_schools) {
				// get schools
				const schools = await ctx.appDbQuery(
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
				schoolData = schools.rows;
			}
			//push institution-data in result
			result.push({
				id: "schools",
				title: "institutions",
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
