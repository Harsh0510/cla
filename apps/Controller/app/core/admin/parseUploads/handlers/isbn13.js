const enc = require("../../lib/enc");

// Matches the Print ISBN13 - the ISBN that will match a teacher's print edition.
module.exports = function (product, productNode) {
	// XPath: /ONIXMessage/Product[DescriptiveDetail[matches(ProductForm,"^[BPS]") or . eq "00"]]/ProductIdentifier[ProductIDType eq "15"]/IDValue
	let node = productNode.queryOneAsRoot(`
		:root:has(> DescriptiveDetail > ProductForm:matches2(${enc(`^[BPS]|^00$`)}))
		> ProductIdentifier:has(> ProductIDType:equals(15))
		> IDValue:not(:empty)
	`);
	if (node) {
		product.isbn13 = node.getInnerText();
		return;
	}

	// XPath: /ONIXMessage/Product[DescriptiveDetail[matches(ProductForm,"^E")]]/RelatedMaterial/RelatedWork[WorkRelationCode eq "01"]/WorkIdentifier[WorkIDType eq "15"]/IDValue
	node = productNode.queryOneAsRoot(`
		:root:has(> DescriptiveDetail > ProductForm:starts-with(E))
		> RelatedMaterial
		> RelatedWork:has(> WorkRelationCode:equals(01))
		> WorkIdentifier:has(> WorkIDType:equals(15))
		> IDValue:not(:empty)
	`);
	if (node) {
		product.isbn13 = node.getInnerText();
		return;
	}

	// XPath: /ONIXMessage/Product[DescriptiveDetail[matches(ProductForm,"^E")]]/RelatedMaterial/RelatedProduct[ProductRelationCode = ("06", "13")][matches(ProductForm,'^B')]/ProductIdentifier[ProductIDType eq "15"]/IDValue
	const nodes = productNode.queryAsRoot(`
		:root:has(> DescriptiveDetail > ProductForm:starts-with(E))
		> RelatedMaterial
		> RelatedProduct:has(> ProductRelationCode:matches2(${enc(`^(06|13)$`)})):has(> ProductForm:starts-with(B))
		> ProductIdentifier:has(> ProductIDType:equals(15))
		> IDValue:not(:empty)
	`);
	if (nodes && Array.isArray(nodes) && nodes.length) {
		product.isbn13 = nodes[0].getInnerText();
		if (nodes[1]) {
			const alternateIsbn13 = nodes[1].getInnerText();
			if (alternateIsbn13 && alternateIsbn13 !== product.isbn13) {
				product.alternateIsbn13 = alternateIsbn13;
			}
		}
		return;
	}

	// XPath: /ONIXMessage/Product/ProductIdentifier[ProductIDType eq '01'][IDTypeName eq 'CLA: publisher-supplied digital ISBN']/IDValue
	node = productNode.queryOne(`
		> ProductIdentifier:has(
			> ProductIDType:equals(01)
		):has(
			> IDTypeName:equals(CLA: publisher-supplied digital ISBN)
		)
		> IDValue:not(:empty)
	`);
	if (node) {
		product.isbn13 = node.getInnerText();
		return;
	}
};
