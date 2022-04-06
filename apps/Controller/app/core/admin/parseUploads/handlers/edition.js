module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> EditionNumber
	`);
	if (node && node.getInnerText()) {
		product.edition = parseInt(node.getInnerText(), 10);
	}
	if (!product.edition) {
		product.edition = 1;
	}
};
