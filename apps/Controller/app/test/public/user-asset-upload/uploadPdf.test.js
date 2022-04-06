const OLD_ENV = process.env;

let isImageUploaded;

function resetAll() {
	isImageUploaded = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	resetAll();
});

afterEach(() => {
	process.env = OLD_ENV; // restore old env
	resetAll();
});

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
		uploadFile: (jpgFilePath, getResourceFun, extraData) => {
			isImageUploaded = true;
			return true;
		},
	};
});

test("When azure is not present", async () => {
	process.env.AZURE_STORAGE_CONNECTION_STRING = false;
	const uploadPdf = require("../../../core/public/user-asset-upload/uploadPdf");
	await uploadPdf("/temp/1234", "/coverage");
	expect(isImageUploaded).toBe(false);
});

test("When azure is present", async () => {
	process.env.AZURE_STORAGE_CONNECTION_STRING = true;
	const uploadPdf = require("../../../core/public/user-asset-upload/uploadPdf");
	await uploadPdf("/temp/1234", "/coverage");
	expect(isImageUploaded).toBe(true);
});
