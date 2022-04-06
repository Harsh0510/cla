const subjectsHandlers = require("../../../../core/admin/parseUploads/handlers/subjects");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
					<Subject>
						<SubjectSchemeIdentifier>12</SubjectSchemeIdentifier>
						<SubjectSchemeVersion>2.0</SubjectSchemeVersion>
						<SubjectCode>YQS</SubjectCode>
					</Subject>
					<Subject>
						<SubjectSchemeIdentifier>12</SubjectSchemeIdentifier>
						<SubjectSchemeVersion>2.0</SubjectSchemeVersion>
						<SubjectCode>YQSB</SubjectCode>
						<SubjectHeadingText>Educational: Biology</SubjectHeadingText>
					</Subject>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any subjects`, async () => {
	xmlValue = `<Product></Product>`;
	subjectsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ subjects: [] });
});

test(`Parse xml have subjects`, async () => {
	subjectsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ subjects: ["YQS"] });
});
