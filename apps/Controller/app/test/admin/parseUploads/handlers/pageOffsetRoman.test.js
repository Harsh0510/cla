const XmlNode = require("../../../../core/admin/lib/XmlNode");
const pageOffsetRomanRaw = require(`../../../../core/admin/parseUploads/handlers/pageOffsetRoman`);
const parseXmlString = require("../../../common/parseXmlString");
let mockProduct, mockProductNode, mockProductNodeValue;

beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	mockProduct = {
		pageOffsetRoman: 0,
	};
	mockProductNodeValue = 5;
	mockProductNode = {
		queryOne: (xmlNodeValue) => {
			return mockProductNodeValue;
		},
	};
}

test(`Get product.pageOffsetRoman value as 5`, async () => {
	const xmlValue = `<Product>5</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {
		pageOffsetRoman: 0,
	};
	pageOffsetRomanRaw(mockProduct, mockProductNode);
	expect(mockProduct.pageOffsetRoman).toEqual(5);
});

test(`Get product.pageOffsetRoman value as 0`, async () => {
	mockProductNodeValue = null;
	mockProduct = {
		pageOffsetRoman: 0,
	};
	pageOffsetRomanRaw(mockProduct, mockProductNode);
	expect(mockProduct.pageOffsetRoman).toEqual(0);
});

test(`Get product.pageOffsetRoman value as 0 when node value < 0`, async () => {
	const xmlValue = `<Product>-5</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {
		pageOffsetRoman: 0,
	};
	pageOffsetRomanRaw(mockProduct, mockProductNode);
	expect(mockProduct.pageOffsetRoman).toEqual(0);
});
