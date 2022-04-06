const generatePdfHighQualityImagesIndexRaw = require("../../../../core/admin/lib/generatePdfHighQualityImages/index");
const path = require("path");

jest.mock("../../../../core/admin/lib/generatePdfHighQualityImages/explicit", () => {
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

async function generatePdfHighQualityImagesIndex(filePath) {
	let res = null;
	try {
		res = await generatePdfHighQualityImagesIndexRaw(filePath);
	} catch (e) {
		res = e;
	}
	return res;
}

test("Execute generate high quality pdf image", async () => {
	const args = "data";
	const result = await generatePdfHighQualityImagesIndex(...args);
	expect(result).toEqual(true);
});
