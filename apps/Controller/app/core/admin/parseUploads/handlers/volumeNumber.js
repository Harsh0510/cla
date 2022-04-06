module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> TitleDetail:has(> TitleType:equals(01))
		> PartNumber[parttype="01"]
	`);
	if (node) {
		product.volumeNumber = node.getInnerText();
	}
};
