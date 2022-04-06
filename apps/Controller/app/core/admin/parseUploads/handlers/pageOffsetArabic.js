module.exports = function (product, productNode) {
	product.pageOffsetArabic = 0;
	const node = productNode.queryOne(`
		> CollateralDetail
		> TextContent:has(> TextType:equals(04))
		> Text[textformat="05"]
		> span.pageOffsetArabic
	`);
	if (!node) {
		return;
	}
	const value = parseInt(node.getInnerText().trim(), 10);
	if (value < 0) {
		return;
	}
	product.pageOffsetArabic = value;
};
