if (process.env.AZURE_STORAGE_CONNECTION_STRING && process.env.CLA_UNLOCK_IMAGE_UPLOAD_AZURE_CONTAINER_NAME) {
	const BlobResource = require("../core/admin/azure/BlobResource");
	const bs = require("../core/admin/azure/azureBlobService");

	const getResource = (databaseId) => new BlobResource(process.env.CLA_UNLOCK_IMAGE_UPLOAD_AZURE_CONTAINER_NAME, databaseId + ".jpg");

	module.exports.uploadUnlockImage = async (jpgFilePath, databaseId) => {
		return bs.uploadFile(jpgFilePath, getResource(databaseId), {
			contentType: "image/jpeg",
		});
	};
	module.exports.getUnlockImageUrl = (databaseId) => {
		return bs.generateSasToken(getResource(databaseId), "r").uri;
	};
} else {
	module.exports.uploadUnlockImage = async (jpgFilePath, databaseId) => {
		return new Promise((res, rej) => {
			setTimeout(() => res(`uploaded:${databaseId}.jpg with Filepath: ${jpgFilePath}`), 2000);
		});
	};
	module.exports.getUnlockImageUrl = (databaseId) => {
		return `https://dummyimage.com/600x400/ff00ff/0000ff.jpg&text=${databaseId}`;
	};
}
