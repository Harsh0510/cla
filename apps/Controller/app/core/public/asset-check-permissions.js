const ensure = require("#tvf-ensure");
const getPermissionsStatus = require("./common/getPermissionsStatus");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	ensure.validAssetIdentifier(ctx, params.isbn, "isbn");
	return {
		status: await getPermissionsStatus(params.isbn),
	};
};
