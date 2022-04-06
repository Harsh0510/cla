const educationalYearGroupHandlers = require("../../../../core/admin/parseUploads/handlers/educationalYearGroup");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
					<Subject>
						<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
						<SubjectSchemeName>CLA: Year</SubjectSchemeName>
						<SubjectSchemeVersion>2.0</SubjectSchemeVersion>
						<SubjectCode>Y</SubjectCode>
						<SubjectHeadingText>Children's, young adult &amp; educational</SubjectHeadingText>
					</Subject>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any educationalYearGroup`, async () => {
	xmlValue = `<Product></Product>`;
	educationalYearGroupHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ educationalYearGroup: [] });
});

test(`Parse xml have educationalYearGroup`, async () => {
	educationalYearGroupHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ educationalYearGroup: ["Children's, young adult & educational"] });
});
