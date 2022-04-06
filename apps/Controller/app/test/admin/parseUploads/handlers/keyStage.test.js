const keyStageHandlers = require("../../../../core/admin/parseUploads/handlers/keyStage");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Subject>
							<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
							<SubjectSchemeName>CLA: Key Stage</SubjectSchemeName>
							<SubjectHeadingText>YQS</SubjectHeadingText>
						</Subject>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any keyStage`, async () => {
	xmlValue = `<Product></Product>`;
	keyStageHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ keyStage: [] });
});

test(`Parse xml have keyStage`, async () => {
	keyStageHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ keyStage: ["YQS"] });
});
