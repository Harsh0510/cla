const moveCoverImageToAzure = require("../../../core/public/user-asset-upload/moveCoverImageToAzure");

function resetAll() {
	isImageUploaded = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

jest.mock("../../../core/admin/azure/BlobResource", () => {
	return function (containerName, imageName) {
		return true;
	};
});

jest.mock("../../../core/public/user-asset-upload/exec", () => {
	return function (cmd, args) {
		return true;
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

jest.mock(`fs-extra`, () => {
	return {
		remove: () => true,
	};
});

test("Function renders correctly", async () => {
	await moveCoverImageToAzure("/temp/1234", 1324574968);
	expect(isImageUploaded).toBe(true);
});
