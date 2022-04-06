const uppercaseFirstLetter = require("./lib/uppercaseFirstLetter");

module.exports = function (product, productNode) {
	const nodes = productNode.query(`
		> DescriptiveDetail
		> Subject:has(
			> SubjectSchemeIdentifier:equals(24)
		):has(
			> SubjectSchemeName:equals(CLA: Exam Board)
		)
		> SubjectHeadingText
	`);
	product.examBoard = nodes.map((node) => uppercaseFirstLetter(node.getInnerText())).filter((value) => !!value);
};
