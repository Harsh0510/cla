const issnIdHandlers = require("../../../../core/admin/parseUploads/handlers/issnId");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<ProductIdentifier>
						<ProductIDType>01</ProductIDType>
						<IDTypeName>CLA content identifier</IDTypeName>
						<IDValue>01</IDValue>
					</ProductIdentifier>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any educationalYearGroup`, async () => {
	xmlValue = `<Product></Product>`;
	issnIdHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml have educationalYearGroup`, async () => {
	issnIdHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ issnId: "01" });
});
