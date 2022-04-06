process.env.AZURE_STORAGE_CONNECTION_STRING = true;
const Process = require("../../../core/public/extract-create/process");

jest.mock(`../../../core/public/extract-create/download`, () => {
	return () => {
		return true;
	};
});

jest.mock(`../../../core/public/extract-create/watermark`, () => {
	return () => {
		return true;
	};
});

jest.mock(`../../../core/public/extract-create/upload`, () => {
	return () => {
		return true;
	};
});

jest.mock(`fs-extra`, () => {
	return {
		unlink: () => true,
	};
});

function resetAll() {
	text = "text";
	extractOid = "1234";
	isbn = "1478521523698";
	pages = [1, 2];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Images uploaded Successfully`, async () => {
	const item = await Process(text, extractOid, isbn, pages);
	expect(item).toEqual([true, true]);
});
