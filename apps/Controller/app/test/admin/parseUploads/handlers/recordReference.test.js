const recordReferenceHandlers = require("../../../../core/admin/parseUploads/handlers/recordReference");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<RecordReference>uk0198359306</RecordReference>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any recordReference`, async () => {
	xmlValue = `<Product></Product>`;
	recordReferenceHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml have recordReference`, async () => {
	recordReferenceHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ recordReference: "uk0198359306" });
});
