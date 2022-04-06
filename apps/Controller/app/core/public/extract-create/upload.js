const az = require("../../admin/azure/azureBlobService");
const makeCopiedResource = require("./makeCopiedResource");

module.exports = async (sourceLocalPath, extractOid, pageIndex) => {
	const br = makeCopiedResource(extractOid, pageIndex);
	await az.uploadFile(sourceLocalPath, br, {
		cacheControl: `max-age=0, no-cache, no-store, must-revalidate`,
	});
	return br;
};
