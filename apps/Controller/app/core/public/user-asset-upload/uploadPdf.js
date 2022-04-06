const BlobResource = require("../../admin/azure/BlobResource");

const bs = (() => {
	if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
		return require("../../admin/azure/azureBlobService");
	}
	return {
		uploadFile() {},
	};
})();

module.exports = (localPath, targetFilename) => {
	return bs.uploadFile(localPath, new BlobResource(process.env.CLA_USER_ASSET_UPLOAD_CONTAINER, targetFilename), {
		contentType: "application/pdf",
	});
};
