const upload = require("../../../core/public/extract-create/upload");
const Context = require("../../common/Context");

let ctx;

jest.mock(`../../../core/public/extract-create/makeCopiedResource`, () => {
	return function () {
		return {
			containerName: "copiedpages",
			blobName: "1234/1.png",
			blobService: { host: "localhost" },
		};
	};
});

jest.mock(`../../../core/admin/azure/azureBlobService`, () => {
	return {
		uploadFile: async () => {
			return true;
		},
	};
});

function resetAll() {
	ctx = new Context();
	sourceLocalPath = "/sourceLocalPath";
	extractOid = "1234";
	pageIndex = 1;
}

beforeEach(resetAll);
afterEach(resetAll);

async function uploadRaw(data) {
	let err = null;
	try {
		ctx.body = await upload(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Images uploaded Successfully`, async () => {
	expect(await uploadRaw(sourceLocalPath, extractOid, pageIndex)).toBeNull();
	expect(ctx.body).toEqual({
		containerName: "copiedpages",
		blobName: "1234/1.png",
		blobService: { host: "localhost" },
	});
});
