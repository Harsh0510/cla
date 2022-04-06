const { BlobServiceClient } = require("@azure/storage-blob");

const BlobService = require("./BlobService");

module.exports = class SharedBlobService extends BlobService {
	init(host, token) {
		let url;
		if (typeof host === "string") {
			url = host;
		} else {
			url = host.primaryHost;
		}
		if (token[0] !== "?") {
			token = "?" + token;
		}
		this.blobService = new BlobServiceClient(url + token);
	}
};
