module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> ProductIdentifier:has(> ProductIDType:equals(06))
		> IDValue:not(:empty)
	`);
	if (node) {
		const text = node.getInnerText().trim();
		if (text) {
			product.doi = text;
		}
	}
};
