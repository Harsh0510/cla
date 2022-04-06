const examBoardHandlers = require("../../../../core/admin/parseUploads/handlers/examBoard");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Subject>
							<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
							<SubjectSchemeName>CLA: Exam Board</SubjectSchemeName>
							<SubjectHeadingText>AQA</SubjectHeadingText>
						</Subject>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any examBoard`, async () => {
	xmlValue = `<Product></Product>`;
	examBoardHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ examBoard: [] });
});

test(`Parse xml have examBoard`, async () => {
	examBoardHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ examBoard: ["AQA"] });
});
