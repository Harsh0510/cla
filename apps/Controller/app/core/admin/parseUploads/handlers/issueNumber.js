module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> TitleDetail:has(> TitleType:equals(01))
		> PartNumber[parttype="02"]
	`);
	if (node) {
		product.issueNumber = node.getInnerText();
	}
};
