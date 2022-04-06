/**
 * Get all unlock attempt on the plaform for cla admins only
 */

const BlobResource = require("./azure/BlobResource");
const blobService = require("./azure/azureBlobService");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	const tok = blobService.generateSasToken(new BlobResource("unlock-attempt", `attempts.xlsx`), "r", null, 10);

	return {
		uri: tok.uri,
	};
};
