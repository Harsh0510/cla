const BlobResource = require("../../../core/admin/azure/BlobResource");

let mockData;
/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockData = {
		containerName: "Test Container Name",
		blobName: "Test Blob Name",
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("get Container Name", async () => {
	const blobResource = new BlobResource(mockData.containerName, mockData.blobName);
	const result = await blobResource.getContainer();
	expect(result).toEqual(mockData.containerName);
});

test("get blob Name", async () => {
	const blobResource = new BlobResource(mockData.containerName, mockData.blobName);
	const result = await blobResource.getBlob();
	expect(result).toEqual(mockData.blobName);
});
