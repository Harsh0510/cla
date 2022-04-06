const rolloverJobStatus = require("../../common/rolloverJobStatus");

const rolloverStatusesForFrontend = rolloverJobStatus.map((row) => ({ id: row, title: row }));

module.exports = async function (params, ctx) {
	//ensure logged in
	await ctx.ensureLoggedIn();

	const userRole = await ctx.getUserRole();
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	return {
		result: [
			{
				id: "status",
				title: "Status",
				data: rolloverStatusesForFrontend,
			},
		],
	};
};
