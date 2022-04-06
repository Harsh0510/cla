const editionHandlers = require("../../../../core/admin/parseUploads/handlers/edition");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
						<EditionNumber>2</EditionNumber>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any edition`, async () => {
	xmlValue = `<Product></Product>`;
	editionHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ edition: 1 });
});

test(`Parse xml have edition`, async () => {
	editionHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ edition: 2 });
});
