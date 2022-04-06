module.exports = class BlobResource {
	/**
	 * @param {string} containerName
	 * @param {string} [blobName]
	 */
	constructor(containerName, blobName) {
		this.containerName = containerName;
		this.blobName = blobName;
	}

	/**
	 * @returns string
	 */
	getContainer() {
		return this.containerName;
	}

	/**
	 * @returns string
	 */
	getBlob() {
		return this.blobName;
	}
};
