const XmlNode = require("../../../../core/admin/lib/XmlNode");
const volumeNumberRaw = require(`../../../../core/admin/parseUploads/handlers/volumeNumber`);
const parseXmlString = require("../../../common/parseXmlString");
let mockProduct, mockProductNode, mockProductNodeValue;

beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	mockProduct = {
		volumeNumber: 0,
	};
	mockProductNodeValue = 1;
	mockProductNode = {
		queryOne: (xmlNodeValue) => {
			return mockProductNodeValue;
		},
	};
}

test(`Get product.volumeNumber value as 1`, async () => {
	const xmlValue = `<Product>1</Product>`;
	const myXmlNode = await parseXmlString(xmlValue);
	mockProductNodeValue = myXmlNode;
	mockProduct = {
		volumeNumber: 0,
	};
	volumeNumberRaw(mockProduct, mockProductNode);
	expect(mockProduct.volumeNumber).toEqual("1");
});

test(`Get product.volumeNumber value as 0`, async () => {
	mockProductNodeValue = null;
	mockProduct = {
		volumeNumber: 0,
	};
	volumeNumberRaw(mockProduct, mockProductNode);
	expect(mockProduct.volumeNumber).toEqual(0);
});
