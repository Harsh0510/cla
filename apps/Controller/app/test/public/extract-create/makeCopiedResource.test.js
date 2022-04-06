const makeCopiedResource = require("../../../core/public/extract-create/makeCopiedResource");

let pageIndex;

jest.mock(`../../../core/admin/azure/BlobResource`, () => {
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

function resetAll() {
	extractOid = "1234";
	pageIndex = 1;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Renders Successfully`, async () => {
	const item = await makeCopiedResource(extractOid, pageIndex);
	expect(item).toEqual({
		containerName: "copiedpages",
		blobName: "1234/1.png",
		blobService: { host: "localhost" },
	});
});
