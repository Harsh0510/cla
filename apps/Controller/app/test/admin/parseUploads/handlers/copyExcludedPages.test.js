const copyExcludedPagesHandlers = require("../../../../core/admin/parseUploads/handlers/copyExcludedPages");
const parseXmlString = require("../../../common/parseXmlString");
const XmlNode = require("../../../../core/admin/lib/XmlNode");

let mockProduct, mockProductNode, mockProductNodeValue;

beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	mockProduct = {};
	mockProductNodeValue = null;
	mockProductNode = {
		queryOne: (xmlNodeValue) => {
			return mockProductNodeValue;
		},
	};
	mockParsePageString = jest.fn();
}

test(`Component renders succesfully`, async () => {
	const xmlValue = `<Product>5</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {};
	copyExcludedPagesHandlers(mockProduct, mockProductNode);
	expect(mockProduct.copyExcludedPages).toEqual([5]);
});

test(`When inner text is not provided`, async () => {
	const xmlValue = `<Product></Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {};
	copyExcludedPagesHandlers(mockProduct, mockProductNode);
	expect(mockProduct).toEqual({});
});

test(`When productNode is not provided`, async () => {
	mockProduct = {};
	copyExcludedPagesHandlers(mockProduct, mockProductNode);
	expect(mockProduct).toEqual({});
});

test(`When innertext is non numeric`, async () => {
	const xmlValue = `<Product>abc</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {};
	copyExcludedPagesHandlers(mockProduct, mockProductNode);
	expect(mockProduct).toEqual({});
});

test(`When more than 1 pages are provided`, async () => {
	const xmlValue = `<Product>5- 6</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {};
	copyExcludedPagesHandlers(mockProduct, mockProductNode);
	expect(mockProduct.copyExcludedPages).toEqual([5, 6]);
});

test(`If first number is greater than last number `, async () => {
	const xmlValue = `<Product>12- 8</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {};
	copyExcludedPagesHandlers(mockProduct, mockProductNode);
	expect(mockProduct).toEqual({});
});
