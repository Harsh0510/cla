const { BlobServiceClient, generateAccountSASQueryParameters } = require("@azure/storage-blob");
const getBlobProps = require("./getBlobProps");

module.exports = class BlobService {
	init(a) {
		this.blobService = BlobServiceClient.fromConnectionString(a || process.env.AZURE_STORAGE_CONNECTION_STRING);
	}

	constructor(...args) {
		this.init(...args);
	}

	/**
	 * @param {BlobResource} resource
	 */
	async doesBlobExist(resource) {
		return await this.blobService.getContainerClient(resource.getContainer()).getBlobClient(resource.getBlob()).exists();
	}

	/**
	 * @param {string} localFilePath
	 * @param {BlobResource} remoteResource
	 * @param {{cacheControl?: string, contentType?: string}} props Properties to set on the resource - same values taken by BlobService.setBlobProperties
	 */
	async uploadFile(localFilePath, remoteResource, props) {
		const cc = this.blobService.getContainerClient(remoteResource.getContainer());
		const bc = cc.getBlockBlobClient(remoteResource.getBlob());
		await bc.uploadFile(localFilePath, getBlobProps(props, localFilePath));
	}

	/**
	 * @param {Buffer} buffer
	 * @param {BlobResource} remoteResource
	 * @param {{cacheControl?: string, contentType?: string}} props Properties to set on the resource - same values taken by BlobService.setBlobProperties
	 */
	async uploadBuffer(buffer, remoteResource, props) {
		const cc = this.blobService.getContainerClient(remoteResource.getContainer());
		const bc = cc.getBlockBlobClient(remoteResource.getBlob());
		await bc.uploadData(buffer, getBlobProps(props, remoteResource.getBlob()));
	}

	/**
	 * @param {BlobResource} remoteResource
	 * @param {string} localFilePath
	 */
	async downloadBlob(remoteResource, localFilePath) {
		const cc = this.blobService.getContainerClient(remoteResource.getContainer());
		const bc = cc.getBlobClient(remoteResource.getBlob());
		await bc.downloadToFile(localFilePath);
	}

	/**
	 * @param {BlobResource} remoteResource
	 */
	async deleteBlob(remoteResource) {
		const cc = this.blobService.getContainerClient(remoteResource.getContainer());
		const bc = cc.getBlobClient(remoteResource.getBlob());
		await bc.deleteIfExists();
	}

	/**
	 * @param {string} remoteContainerName
	 */
	async deleteContainer(remoteContainerName) {
		const cc = this.blobService.getContainerClient(remoteContainerName);
		await cc.deleteIfExists();
	}

	/**
	 * @param {string} containerName
	 */
	async getAllBlobsInContainer(containerName) {
		const cc = this.blobService.getContainerClient(containerName);
		const blobs = cc.listBlobsFlat();
		const ret = [];
		for await (const blob of blobs) {
			ret.push(blob);
		}
		return ret;
	}

	/**
	 * @param {string} containerName
	 */
	async getAllDirectoriesInContainer(containerName) {
		const cc = this.blobService.getContainerClient(containerName);
		const blobs = cc.listBlobsByHierarchy("/");
		const ret = [];
		for await (const item of blobs) {
			if (item.kind === "prefix") {
				ret.push(item);
			}
		}
		return ret;
	}

	/**
	 * @param {BlobResource} remoteResource
	 * @param {string} permissions
	 * @param {string} [userIp]
	 * @returns {{ token: string, uri: number }}
	 */
	generateSasToken(remoteResource, permissions, userIp, numMinutes = 180) {
		const startDate = new Date();
		const expiryDate = new Date(startDate);
		expiryDate.setMinutes(startDate.getMinutes() + numMinutes);
		startDate.setMinutes(startDate.getMinutes() - 60);

		const sharedAccessPolicy = {
			permissions: permissions || "r",
			startsOn: startDate,
			expiresOn: expiryDate,
			protocol: "https",
			services: "b",
			resourceTypes: remoteResource.getBlob() ? "o" : "co",
		};
		if (userIp) {
			sharedAccessPolicy.ipRange = {
				start: userIp,
				end: userIp,
			};
		}

		const token = generateAccountSASQueryParameters(sharedAccessPolicy, this.blobService.credential).toString();
		const cc = this.blobService.getContainerClient(remoteResource.getContainer());
		const bc = cc.getBlobClient(remoteResource.getBlob());

		let sasUrl = bc.url;
		if (bc.url.indexOf("?") < 0) {
			sasUrl += "?";
		} else {
			sasUrl += "&";
		}
		sasUrl += token;
		return {
			token: token,
			uri: sasUrl,
		};
	}
};
