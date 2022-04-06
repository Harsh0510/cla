module.exports = async (generateExtractViewUrls, pagesWithoutExcludedPages, isWatermarked, isbn13, extractOid, pages, copyExcludedPages) => {
	const copyExcludedPagesMap = (() => {
		const ret = Object.create(null);
		if (Array.isArray(copyExcludedPages)) {
			for (const page of copyExcludedPages) {
				ret[page] = true;
			}
		}
		return ret;
	})();
	let urls;
	if (pagesWithoutExcludedPages.length) {
		urls = await generateExtractViewUrls(isWatermarked, isbn13, extractOid, pagesWithoutExcludedPages);
	} else {
		urls = [];
	}
	let idx = 0;
	const ret = [];
	for (const page of pages) {
		if (copyExcludedPagesMap[page]) {
			ret.push(null);
		} else {
			ret.push(urls[idx]);
			idx++;
		}
	}
	return ret;
};
