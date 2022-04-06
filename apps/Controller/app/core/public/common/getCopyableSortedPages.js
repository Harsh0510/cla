module.exports = function (pages, copyExcludedPages) {
	let ret;
	if (Array.isArray(copyExcludedPages)) {
		const map = Object.create(null);
		for (const pg of copyExcludedPages) {
			map[pg] = true;
		}
		ret = [];
		for (const page of pages) {
			if (!map[page]) {
				ret.push(page);
			}
		}
	} else {
		ret = pages.slice(0);
	}
	ret.sort((a, b) => a - b);
	return ret;
};
