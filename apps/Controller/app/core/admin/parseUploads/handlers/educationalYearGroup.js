module.exports = function (product, productNode) {
	const nodes = productNode.query(`
		> DescriptiveDetail
		> Subject:has(
			> SubjectSchemeIdentifier:equals(24)
		):has(
			> SubjectSchemeName:equals(CLA: Year)
		)
		> SubjectHeadingText
	`);
	product.educationalYearGroup = nodes.map((node) => node.getInnerText());
};
