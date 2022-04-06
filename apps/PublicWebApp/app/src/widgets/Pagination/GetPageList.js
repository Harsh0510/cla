export default function getPageList(currentPage, pageCount, neighbours) {
	const ret = [];
	const start = Math.max(0, currentPage - neighbours);
	const end = Math.min(pageCount - 1, currentPage + neighbours);
	if (currentPage > neighbours) {
		ret.push({
			type: "NUMBER",
			index: 0,
			active: 0 === currentPage,
		});
	}
	if (currentPage > neighbours + 1) {
		ret.push({
			type: "DOTS",
		});
	}
	for (let i = start; i <= end; ++i) {
		ret.push({
			type: "NUMBER",
			index: i,
			active: i === currentPage,
		});
	}
	if (currentPage + neighbours + 2 < pageCount) {
		ret.push({
			type: "DOTS",
		});
	}
	if (currentPage + neighbours + 1 < pageCount) {
		ret.push({
			type: "NUMBER",
			index: pageCount - 1,
			active: currentPage === pageCount - 1,
		});
	}
	return ret;
}
