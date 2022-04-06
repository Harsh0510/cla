module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> CollateralDetail
		> TextContent:has(> TextType:equals(04))
		> Text[textformat="05"]
		> div.toc
	`);
	if (node) {
		const toc = node.getInnerXml();
		if (toc) {
			product.toc = toc.trim().replace(/\s+/g, " ");
		}
	}
};
