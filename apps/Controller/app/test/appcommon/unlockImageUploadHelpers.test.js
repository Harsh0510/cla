let isImageUploaded, isImageRetrived;
const OLD_ENV = process.env;

function resetAll() {
	isImageUploaded = false;
	isImageRetrived = false;
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

jest.mock("../../core/admin/azure/BlobResource", () => {
	return function (containerName, imageName) {
		return true;
	};
});

jest.mock("../../core/admin/azure/azureBlobService", () => {
	return {
		uploadFile: (jpgFilePath, getResourceFun, extraData) => {
			isImageUploaded = true;
			return true;
		},
		generateSasToken: (getResourceFun, identifier) => {
			isImageRetrived = true;
			return {
				url: "https://something.test.com",
			};
		},
	};
});

test("when azure is present", async () => {
	process.env.AZURE_STORAGE_CONNECTION_STRING = "connectionString";
	process.env.IS_AZURE = true;
	process.env.CLA_UNLOCK_IMAGE_UPLOAD_AZURE_CONTAINER_NAME = "test Container";

	const unlockImageUploadHelper = require("../../common/unlockImageUploadHelpers");
	expect(isImageUploaded).toBe(false);
	expect(isImageRetrived).toBe(false);
	await unlockImageUploadHelper.uploadUnlockImage("/temp/1234", 1);
	expect(isImageUploaded).toBe(true);
	await unlockImageUploadHelper.getUnlockImageUrl(1);
	expect(isImageRetrived).toBe(true);
});

test("when azure is NOT present", async () => {
	process.env.AZURE_STORAGE_CONNECTION_STRING = false;
	process.env.IS_AZURE = false;
	process.env.CLA_UNLOCK_IMAGE_UPLOAD_AZURE_CONTAINER_NAME = false;
	const unlockImageUploadHelper = require("../../common/unlockImageUploadHelpers");
	const item = await unlockImageUploadHelper.uploadUnlockImage("/temp/1234", 1052);
	expect(item.toString().indexOf(1052)).not.toBe(-1);
	const item2 = await unlockImageUploadHelper.getUnlockImageUrl(1052);
	expect(item2.toString().indexOf("dummyimage.com")).not.toBe(-1);
});
