const bs = require("../admin/azure/azureBlobService");
const BlobResource = require("../admin/azure/BlobResource");
const makeCopiedResource = require("./extract-create/makeCopiedResource");

module.exports = async function (isWatermarked, isbn13, extractOid, pages) {
	let results;
	if (isWatermarked) {
		results = await Promise.all(pages.map((page) => bs.generateSasToken(makeCopiedResource(extractOid, page - 1), "r")));
	} else {
		results = await Promise.all(pages.map((page) => bs.generateSasToken(new BlobResource("highqualitypages", `${isbn13}/${page - 1}.png`), "r")));
	}
	return results.map((obj) => obj.uri);
};
