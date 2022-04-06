module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> TitleDetail:has(> TitleType:equals(01))
		> TitleElement:has(> TitleElementLevel:equals(01))
		> Subtitle
	`);
	if (node) {
		product.subtitle = node.getInnerText();
	}
};
