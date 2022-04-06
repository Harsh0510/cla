module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> PublishingDetail
		> Imprint
		> ImprintName:not(:empty)
	`);
	if (node) {
		product.imprint = node.getInnerText().trim();
	}
};
