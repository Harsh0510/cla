const generatePdfPagePreviewsIndexRaw = require("../../../../core/admin/lib/generatePdfPagePreviews/index");

jest.mock("../../../../core/admin/lib/generatePdfPagePreviews/explicit", () => {
	return function () {
		return true;
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {}

/**
 * Clear everything before and after each test
 */

beforeEach(resetAll);
afterEach(resetAll);

async function generatePdfPagePreviewsIndex(filePath) {
	let res = null;
	try {
		res = await generatePdfPagePreviewsIndexRaw(filePath);
	} catch (e) {
		res = e;
	}
	return res;
}

test("Execute generate high quality pdf image", async () => {
	const args = "data";
	const result = await generatePdfPagePreviewsIndex(...args);
	expect(result).toEqual(true);
});
