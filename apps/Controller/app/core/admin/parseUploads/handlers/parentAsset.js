const enc = require("../../lib/enc");

module.exports = function (product, productNode) {
	const parentAsset = {};
	{
		// identifier
		const node = productNode.queryOne(`
			> DescriptiveDetail
			> Collection:has(
				> CollectionType:equals(10)
			)
			> CollectionIdentifier:has(
				> CollectionIDType:matches2(${enc(`^01|02$`)})
			)
			> IDValue:not(:empty)
		`);
		if (node) {
			parentAsset.identifier = (node.getInnerText() || "").trim();
		}
	}
	{
		// title
		const node = productNode.queryOne(`
			> DescriptiveDetail
			> Collection:has(
				> CollectionType:equals(10)
			)
			> TitleDetail:has(
				> TitleType:matches2(${enc(`^01|02$`)})
			)
			> TitleStatement:not(:empty)
		`);
		if (node) {
			parentAsset.title = (node.getInnerText() || "").trim();
		}
	}
	product.parentAsset = parentAsset;
};
