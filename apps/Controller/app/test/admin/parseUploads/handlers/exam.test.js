const examHandlers = require("../../../../core/admin/parseUploads/handlers/exam");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Subject>
							<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
							<SubjectSchemeName>CLA: Exam</SubjectSchemeName>
							<SubjectHeadingText>AQA</SubjectHeadingText>
						</Subject>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any exam`, async () => {
	xmlValue = `<Product></Product>`;
	examHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ exam: [] });
});

test(`Parse xml have exam`, async () => {
	examHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ exam: ["AQA"] });
});
