const OLD_ENV = process.env;

jest.mock("../../../core/admin/azure/BlobResource", () => {
	return class {
		constructor(containerName, blobName) {
			this.containerName = containerName;
			this.blobName = blobName;
			this.blobService = {
				host: "localhost",
			};
		}
	};
});

jest.mock("../../../core/admin/azure/azureBlobService", () => {
	return {
		generateSasToken: () => {
			return {
				uri: "https://test-uri",
				token: "a".repeat(32),
			};
		},
	};
});

beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
});

afterEach(() => {
	process.env = OLD_ENV; // restore old env
});

test("When azure environment is not set", () => {
	const getExtractUserAssetUrl = require("../../../core/public/common/getExtractUserAssetUrl");
	expect(getExtractUserAssetUrl()).toEqual("https://occcladevstorage.blob.core.windows.net/public/Dickens_Carol.pdf");
});

test("When azure environment is set", () => {
	process.env.AZURE_STORAGE_CONNECTION_STRING = true;
	const getExtractUserAssetUrl = require("../../../core/public/common/getExtractUserAssetUrl");
	expect(getExtractUserAssetUrl()).toEqual("https://test-uri");
});
