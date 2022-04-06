const success = [true, false];

module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();
	const userRole = await ctx.getUserRole();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	const result = [];

	//push success data in result
	result.push({
		id: "success",
		title: "Success",
		// data: success.map((row) => ({ id: row, title: row })),
		data: success.map((row) => ({ id: row, title: row.toString() })),
	});

	let stageData = [];

	const stages = await ctx.appDbQuery(
		`
			SELECT
				stage As id,
				stage AS title
			FROM
				asset_processing_log
			GROUP BY
				stage
			ORDER BY
				stage ASC

		`
	);
	stageData = stages.rows;
	result.push({
		id: "stage",
		title: "Stage",
		data: stageData,
	});

	return {
		result: result,
	};
};
