module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> ContentForm:not(:empty)
	`);
	if (node) {
		const text = node.getInnerText();
		if (text) {
			const trimmed = text.trim().toUpperCase();
			if (trimmed) {
				product.contentForm = trimmed;
			}
		}
	}
};
