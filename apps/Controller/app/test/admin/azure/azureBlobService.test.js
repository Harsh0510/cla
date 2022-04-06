const azureBlobService = require("../../../core/admin/azure/azureBlobService");

jest.mock("../../../core/admin/azure/BlobService", () => {
	return class {
		init(a, b, c, d) {
			this.blobService = function () {
				() => jest.fn();
			};
		}

		constructor() {
			this.init.apply(this, arguments);
		}
	};
});

test(`Returns Blobservice Successfully`, async () => {
	const item = azureBlobService;
	expect(typeof item.blobService).toEqual("function");
});
