const bs = require("../../admin/azure/azureBlobService");
const container = process.env.CLA_USER_ASSET_UPLOAD_CONTAINER;

module.exports = (() => {
	if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
		const BlobResource = require("../../admin/azure/BlobResource");
		return (filename) => {
			return bs.generateSasToken(new BlobResource(container, filename)).uri;
		};
	}
	return () => "https://occcladevstorage.blob.core.windows.net/public/Dickens_Carol.pdf";
})();
