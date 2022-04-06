const getFirstWorkingLink = require("../../../../core/public/async_task/asset_buy_book_link_update/getFirstWorkingLink");

let mockLinkResult, mockAsset, mockIsWorkingLink;

/**mock functions */
jest.mock(`../../../../common/parseBuyBookRules`, () => {
	return function () {
		return mockLinkResult;
	};
});
jest.mock(`../../../../common/customAxios`, () => {
	return {
		head: async () => {
			return mockIsWorkingLink;
		},
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockLinkResult = ["test.com/isbn"];
	mockAsset = {
		isbn: "987654321111",
	};
	mockIsWorkingLink: true;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Return null when no rules found`, async () => {
	const result = await getFirstWorkingLink(null, mockAsset);
	expect(result).toEqual(null);
});

test(`Return Links when pass rules`, async () => {
	const result = await getFirstWorkingLink(["test.com/isbn"], mockAsset);
	expect(result).toEqual("test.com/isbn");
});

test(`Return null when rules are invalid`, async () => {
	mockLinkResult = null;
	const result = await getFirstWorkingLink(["test.com/isbn"], mockAsset);
	expect(result).toEqual(null);
});

test(`Return null when rules are blank array`, async () => {
	mockLinkResult = [];
	mockIsWorkingLink = false;
	const result = await getFirstWorkingLink([], mockAsset);
	expect(result).toEqual(null);
});

test(`Return null when link is invalid`, async () => {
	mockLinkResult = [];
	mockIsWorkingLink = false;
	const result = await getFirstWorkingLink(["12345654"], mockAsset);
	expect(result).toEqual(null);
});
