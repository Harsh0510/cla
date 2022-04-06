const enc = require("../../lib/enc");

module.exports = function (product, productNode) {
	const nodes = productNode.query(`
		> DescriptiveDetail
		> Subject:has(
			> SubjectSchemeIdentifier:equals(24)
		):has(
			> SubjectSchemeName:matches2(${enc(`^CLA: Level \\\(Scotland\\\)$`)})
		)
		> SubjectHeadingText
	`);
	product.scottishLevel = nodes.map((node) => (node.getInnerText() || "").trim()).filter((value) => !!value);
};
