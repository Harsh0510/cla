const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const watermark = require("../../../core/public/extract-create/watermark");
const Context = require("../../common/Context");

let ctx;

const testAssetDirectory = path.join(__dirname, "dummyImages");
const localImagePath = path.join(testAssetDirectory, "dummy-thumbnail.png");

jest.mock(`../../../core/public/extract-create/makeCopiedResource`, () => {
	return function () {
		return {
			containerName: "copiedpages",
			blobName: "1234/1.png",
			blobService: { host: "localhost" },
		};
	};
});

jest.mock(`../../../core/admin/azure/azureBlobService`, async () => {
	return {
		uploadFile: () => {
			return true;
		},
	};
});

const TARGET_IMAGE_PATH = path.join(os.tmpdir(), "targetImagePath.png");
const TEXT = "text";

function resetAll() {
	ctx = new Context();
	try {
		fs.unlinkSync(TARGET_IMAGE_PATH);
	} catch (e) {}
}

beforeEach(resetAll);
afterEach(resetAll);

async function watermarkRaw(localImagePath, text, targetImagePath) {
	let err = null;
	try {
		ctx.body = await watermark(localImagePath, text, targetImagePath);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`renders Successfully`, async () => {
	const item = await watermarkRaw(localImagePath, TEXT, TARGET_IMAGE_PATH);
	expect(item).toEqual(null);
});

test(`Error when Image path is wrong`, async () => {
	const localImagePath = path.join(testAssetDirectory, "dummythumbnail.png");
	const item = await watermarkRaw(localImagePath, TEXT, TARGET_IMAGE_PATH);
	expect(item).not.toBe(null);
});
