const download = require("../../../core/public/extract-create/download");
const Context = require("../../common/Context");

let ctx, isbn, pageIndex, targetPath;

jest.mock(`../../../core/admin/azure/azureBlobService`, () => {
	return {
		downloadBlob: () => {
			return true;
		},
	};
});

function resetAll() {
	ctx = new Context();
	isbn = "";
	pageIndex = 1;
	targetPath = "/targetpath";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Renders Successfully`, async () => {
	const item = download(isbn, pageIndex, targetPath);
	expect(item).toBe(true);
});
