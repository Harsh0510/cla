const SharedBlobService = require("../../../core/admin/azure/SharedBlobService");

jest.mock("@azure/storage-blob", () => {
	return {
		BlobServiceClient: class {
			constructor(v) {
				this.foo = v;
			}
		},
	};
});

test("Called sharedBlobService 1", async () => {
	const sharedBlobService = new SharedBlobService("abc:", "/def");
	expect(sharedBlobService.blobService.foo).toBe("abc:?/def");
});

test("Called sharedBlobService 2", async () => {
	const sharedBlobService = new SharedBlobService(
		{
			primaryHost: "XXX",
			secondaryHost: "YYY",
		},
		"/def"
	);
	expect(sharedBlobService.blobService.foo).toBe("XXX?/def");
});
