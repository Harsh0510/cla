const imprintHandlers = require("../../../../core/admin/parseUploads/handlers/imprint");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
				<PublishingDetail>
					<Imprint>
					  <ImprintName>OUP Oxford</ImprintName>
					</Imprint>
				</PublishingDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any imprint`, async () => {
	xmlValue = `<Product></Product>`;
	imprintHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml have imprint`, async () => {
	imprintHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ imprint: "OUP Oxford" });
});
