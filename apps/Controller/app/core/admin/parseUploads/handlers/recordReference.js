module.exports = function (product, productNode) {
	const node = productNode.queryOne(`> RecordReference`);
	if (node) {
		product.recordReference = node.getInnerText();
	}
};
