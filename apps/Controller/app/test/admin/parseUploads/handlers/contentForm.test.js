const contentFormHandlers = require("../../../../core/admin/parseUploads/handlers/contentForm");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
						<ContentForm>MI</ContentForm>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml wihout any contentForm`, async () => {
	xmlValue = `<Product></Product>`;
	contentFormHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml have contentForm`, async () => {
	contentFormHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ contentForm: "MI" });
});

test("parse xml as blank spaces", async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<ContentForm>    </ContentForm>
					</DescriptiveDetail>
				</Product>
	`;
	contentFormHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});
