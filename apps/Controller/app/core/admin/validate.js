const playgroundAssetValidator = require("./parseUploads/playgroundAssetValidator")();

/**
 * Invokes the validator on the directory `dir` and returns the results.
 * Does not touch the database - this function merely validates.
 */
module.exports = async function (params, ctx) {
	await ctx.ensureClaAdminRequest();
	let assets;
	if (params.assets) {
		if (Array.isArray(params.assets)) {
			assets = params.assets;
		} else {
			assets = [params.assets];
		}
	} else {
		assets = [];
	}
	return await playgroundAssetValidator.process(assets);
};
