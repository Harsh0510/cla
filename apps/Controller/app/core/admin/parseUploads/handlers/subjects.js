module.exports = function (product, productNode) {
	const node = productNode.queryOne(`
		> DescriptiveDetail
		> Subject:has(> SubjectSchemeIdentifier:equals(12))
		> SubjectCode
	`);
	if (node && node.getInnerText()) {
		product.subjects = node
			.getInnerText()
			.trim()
			.split(/\s*,\s*/)
			.map((subject) => subject.toUpperCase())
			.filter((subject) => subject.length < 10);
	} else {
		product.subjects = [];
	}
};
