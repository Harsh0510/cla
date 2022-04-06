//const getPdfPageCountIndex = require('../../../core/admin/lib/getPdfPageCount/index');
const getPdfPageCountIndexRaw = require("../../../../core/admin/lib/getPdfPageCount/index");
const path = require("path");

let actualPdfFilePath;

jest.mock("../../../../core/admin/lib/getPdfPageCount/explicit", () => {
	return function () {
		return true;
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	actualPdfFilePath = path.join(__dirname, "dummy.pdf");
}

/**
 * Clear everything before and after each test
 */

beforeEach(resetAll);
afterEach(resetAll);

async function getPdfPageCountIndex(filePath) {
	let res = null;
	try {
		res = await getPdfPageCountIndexRaw(filePath);
	} catch (e) {
		res = e;
	}
	return res;
}

test(`Get pdf page count`, async () => {
	const result = await getPdfPageCountIndex(actualPdfFilePath);
	expect(result).toEqual(true);
});
