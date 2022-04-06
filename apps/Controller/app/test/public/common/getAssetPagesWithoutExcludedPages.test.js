const func = require("../../../core/public/common/getAssetPagesWithoutExcludedPages");

test(`Component render successfully`, async () => {
	const pages = [1, 2, 7, 20, 55];
	const copyExcludedPages = [4, 5, 25, 52];
	const item = func(pages, copyExcludedPages);
	expect(item).toEqual([1, 2, 5, 18, 51]);
});

test(`when copyExcludedPages is not passed as an array`, async () => {
	const pages = [1, 2, 3, 55];
	const item = func(pages, null);
	expect(item).toEqual([1, 2, 3, 55]);
});
