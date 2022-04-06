const levelHandlers = require("../../../../core/admin/parseUploads/handlers/level");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Subject>
							<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
							<SubjectSchemeName>CLA: Level</SubjectSchemeName>
							<SubjectHeadingText>secondary</SubjectHeadingText>
						</Subject>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`XML does not have a level`, async () => {
	xmlValue = `<Product></Product>`;
	levelHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ level: [] });
});

test(`XML has level`, async () => {
	levelHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ level: ["Secondary"] });
});
