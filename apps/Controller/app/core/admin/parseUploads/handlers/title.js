module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> TitleDetail:has(> TitleType:equals(01))
		> TitleStatement
	`);
	if (node) {
		product.title = node.getInnerText();
	}
};
