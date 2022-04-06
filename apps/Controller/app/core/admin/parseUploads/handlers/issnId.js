module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> ProductIdentifier:has(> ProductIDType:equals(01)):has(> IDTypeName:equals(CLA content identifier))
		> IDValue:not(:empty)
	`);
	if (node) {
		product.issnId = node.getInnerText();
	}
};
