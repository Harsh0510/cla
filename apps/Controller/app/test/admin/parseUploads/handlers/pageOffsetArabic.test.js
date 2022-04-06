const XmlNode = require("../../../../core/admin/lib/XmlNode");
const pageOffsetArabicRaw = require(`../../../../core/admin/parseUploads/handlers/pageOffsetArabic`);
const parseXmlString = require("../../../common/parseXmlString");
let mockProduct, mockProductNode, mockProductNodeValue;

beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	mockProduct = {
		pageOffsetArabic: 0,
	};
	mockProductNodeValue = 5;
	mockProductNode = {
		queryOne: (xmlNodeValue) => {
			return mockProductNodeValue;
		},
	};
}

test(`Get product.pageoffsetArabic value as 5`, async () => {
	const xmlValue = `<Product>5</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {
		pageOffsetArabic: 0,
	};
	pageOffsetArabicRaw(mockProduct, mockProductNode);
	expect(mockProduct.pageOffsetArabic).toEqual(5);
});

test(`Get product.pageoffsetArabic value as 0`, async () => {
	mockProductNodeValue = null;
	mockProduct = {
		pageOffsetArabic: 0,
	};
	pageOffsetArabicRaw(mockProduct, mockProductNode);
	expect(mockProduct.pageOffsetArabic).toEqual(0);
});

test(`Get product.pageoffsetArabic value as 0 when node value < 0`, async () => {
	const xmlValue = `<Product>-5</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {
		pageOffsetArabic: 0,
	};
	pageOffsetArabicRaw(mockProduct, mockProductNode);
	expect(mockProduct.pageOffsetArabic).toEqual(0);
});
