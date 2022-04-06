const func = require("../../../core/public/common/getCopyableSortedPages");

test(`Component render successfully`, async () => {
	const pages = [12];
	const copyExcludedPages = [4, 5, 6, 11, 14, 18, 22];
	const item = await func(pages, copyExcludedPages);
	expect(item).toEqual([12]);
});

test(`when copyExcludedPages is not passed as an array`, async () => {
	const pages = [1, 2, 3, 55];
	const item = await func(pages);
	expect(item).toEqual([1, 2, 3, 55]);
});
