const isProduction = require("../../common/isProduction");

module.exports = async function (app, asyncRunner) {
	app.route("/search/search", require("./assetSearch/index"));
	app.route("/search/simple-search", require("./assetSearch/simpleSearch"));
	app.route("/search/get-filters", require("./assetSearch/get-filters"));
	app.route("/search/external-assets", require("./external-assets"));

	if (!isProduction) {
		// Endpoint: Dev-only helper methods that dump table data.
		app.route("/search/get-assets", async (params, ctx) => {
			const data = await ctx.appDbQuery("SELECT * FROM asset");
			return data.rows;
		});
	}
};
