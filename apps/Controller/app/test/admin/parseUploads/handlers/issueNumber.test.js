const XmlNode = require("../../../../core/admin/lib/XmlNode");
const issueNumberRaw = require(`../../../../core/admin/parseUploads/handlers/issueNumber`);
const parseXmlString = require("../../../common/parseXmlString");
let mockProduct, mockProductNode, mockProductNodeValue;

beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	mockProduct = {
		issueNumber: 0,
	};
	mockProductNodeValue = 2;
	mockProductNode = {
		queryOne: (xmlNodeValue) => {
			return mockProductNodeValue;
		},
	};
}

test(`Get product.issueNumber value as 2`, async () => {
	const xmlValue = `<Product>2</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {
		issueNumber: 0,
	};
	issueNumberRaw(mockProduct, mockProductNode);
	expect(mockProduct.issueNumber).toEqual("2");
});

test(`Get product.issueNumber value as 0`, async () => {
	mockProductNodeValue = null;
	mockProduct = {
		issueNumber: 0,
	};
	issueNumberRaw(mockProduct, mockProductNode);
	expect(mockProduct.issueNumber).toEqual(0);
});
