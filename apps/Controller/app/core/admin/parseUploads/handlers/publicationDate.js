module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> PublishingDetail
		> PublishingDate:has(> PublishingDateRole:equals(01))
		> Date
	`);
	if (node) {
		const str = (node.getInnerText() || "").trim().replace(/[^0-9]+/g, "");
		const year = parseInt(str.slice(0, 4), 10);
		const month = str.length >= 6 ? parseInt(str.slice(4, 6), 10) - 1 : 0;
		const day = str.length >= 8 ? parseInt(str.slice(6), 10) : 1;
		product.publicationDate = Date.UTC(year, month, day, 0, 0, 0, 0) / 1000;
	}
};
