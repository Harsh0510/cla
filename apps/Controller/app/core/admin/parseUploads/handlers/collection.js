module.exports = function (product, productNode) {
	const nodes = productNode.query(`
		> DescriptiveDetail
		> Subject:has(
			> SubjectSchemeIdentifier:equals(24)
		):has(
			> SubjectSchemeName:equals(CLA: Collection)
		)
		> SubjectHeadingText
	`);
	product.collection = nodes.map((node) => (node.getInnerText() || "").trim()).filter((value) => !!value);
};
