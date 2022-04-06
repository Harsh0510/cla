/**
 * @param {number[]} pages Assumes _none_ of the pages is an excluded page.
 * @param {number[]} copyExcludedPages
 */
module.exports = (pages, copyExcludedPages) => {
	const pagesLength = pages.length;
	const excludedPageLength = Array.isArray(copyExcludedPages) ? copyExcludedPages.length : 0;
	let excIndex = 0;
	let countSoFar = 0;
	const numBelow = [];
	for (let i = 0; i < pagesLength; ++i) {
		for (; excIndex < excludedPageLength; ++excIndex) {
			if (copyExcludedPages[excIndex] > pages[i]) {
				break;
			}
			countSoFar++;
		}
		numBelow.push(countSoFar);
	}
	const pagesWithViewUrls = [];
	for (let i = 0; i < pagesLength; ++i) {
		pagesWithViewUrls.push(pages[i] - numBelow[i]);
	}
	return pagesWithViewUrls;
};
