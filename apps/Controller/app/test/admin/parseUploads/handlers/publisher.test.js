const publisherHandlers = require("../../../../core/admin/parseUploads/handlers/publisher");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Subject>
							<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
							<SubjectSchemeName>CLA: Publisher</SubjectSchemeName>
							<SubjectHeadingText>Oxford University Press</SubjectHeadingText>
						</Subject>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any publisher`, async () => {
	xmlValue = `<Product></Product>`;
	publisherHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml have publisher`, async () => {
	publisherHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ publisher: "Oxford University Press" });
});
