module.exports = async (app, asyncRunner) => {
	return Promise.all([
		require("./admin/routes")(app, asyncRunner),
		require("./auth/routes")(app, asyncRunner),
		require("./public/routes")(app, asyncRunner),
		require("./search/routes")(app, asyncRunner),
	]);
};
