const BlobResource = require("../../admin/azure/BlobResource");
const az = require("../../admin/azure/azureBlobService");

module.exports = (isbn, pageIndex, targetPath) => {
	return az.downloadBlob(new BlobResource("highqualitypages", isbn + "/" + pageIndex + ".png"), targetPath);
};
