const generateExtractViewUrlsWrapRaw = require("../../../core/public/common/generateExtractViewUrlsWrap");

let mockFunction;

// jest.mock("generateExtractViewUrls", () => {
//     return true;
// });

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockFunction = jest.fn();
}

/**
 * Clear everything before and after each test
 */
beforeEach(() => {
	jest.resetModules();
	resetAll();
});
afterEach(resetAll);

async function generateExtractViewUrls(isWatermarked, isbn13, extractOid, pagesWithViewUrls, userIp) {
	const data = ["https://image1.jpg", "https://image2.jpg"];
	return data;
}

function getParams() {
	return {
		generateExtractViewUrls: generateExtractViewUrls(),
		isbn13: "9781471867903",
		isWatermarked: false,
		extractOid: "8e412a7d12117bdef1d13d0d20057b954fdc",
		pages: [1, 2, 3, 55],
		copyExcludedPages: [2, 4, 55],
		pagesWithoutExcludedPages: [1, 3],
	};
}

test(`Component render successfully when extract have excluded pages`, async () => {
	const params = getParams();
	const isbn13 = params.isbn13;
	const isWatermarked = params.isWatermarked;
	const extractOid = params.extractOid;
	const pages = params.pages;
	const copyExcludedPages = params.copyExcludedPages;
	const pagesWithoutExcludedPages = params.pagesWithoutExcludedPages;
	const item = await generateExtractViewUrlsWrapRaw(
		generateExtractViewUrls,
		pagesWithoutExcludedPages,
		isWatermarked,
		isbn13,
		extractOid,
		pages,
		copyExcludedPages
	);
	expect(item).toEqual(["https://image1.jpg", null, "https://image2.jpg", null]);
});

test(`Component render successfully when extract not have excluded pages`, async () => {
	const params = getParams();
	params.pages = [1, 3];
	params.copyExcludedPages = null;
	const isbn13 = params.isbn13;
	const isWatermarked = params.isWatermarked;
	const extractOid = params.extractOid;
	const pages = params.pages;
	const copyExcludedPages = params.copyExcludedPages;
	const pagesWithoutExcludedPages = params.pagesWithoutExcludedPages;
	const item = await generateExtractViewUrlsWrapRaw(
		generateExtractViewUrls,
		pagesWithoutExcludedPages,
		isWatermarked,
		isbn13,
		extractOid,
		pages,
		copyExcludedPages
	);
	expect(item).toEqual(["https://image1.jpg", "https://image2.jpg"]);
});

test(`Component render successfully when all pages are excluded`, async () => {
	const params = getParams();
	params.pages = [2, 4, 55];
	params.pagesWithoutExcludedPages = [];
	const isbn13 = params.isbn13;
	const isWatermarked = params.isWatermarked;
	const extractOid = params.extractOid;
	const pages = params.pages;
	const copyExcludedPages = params.copyExcludedPages;
	const pagesWithoutExcludedPages = params.pagesWithoutExcludedPages;
	const item = await generateExtractViewUrlsWrapRaw(
		generateExtractViewUrls,
		pagesWithoutExcludedPages,
		isWatermarked,
		isbn13,
		extractOid,
		pages,
		copyExcludedPages
	);
	expect(item).toEqual([null, null, null]);
});
