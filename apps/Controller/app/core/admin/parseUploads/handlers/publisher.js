module.exports = function (product, productNode) {
	const publisherNameNode = productNode.queryOne(`
		> DescriptiveDetail
		> Subject:has(> SubjectSchemeIdentifier:equals(24)):has(> SubjectSchemeName:equals(CLA: Publisher))
		> SubjectHeadingText
	`);
	if (publisherNameNode) {
		product.publisher = publisherNameNode.getInnerText();
	}
};
