const titleHandlers = require("../../../../core/admin/parseUploads/handlers/title");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
					<TitleDetail>
						<TitleType>01</TitleType>
						<TitleElement>
							<TitleElementLevel>02</TitleElementLevel>
							<TitleText>Selected Tales from Chaucer</TitleText>
						</TitleElement>
						<TitleStatement>Selected Tales from Chaucer</TitleStatement>
					</TitleDetail>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any title`, async () => {
	xmlValue = `<Product></Product>`;
	titleHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml have title`, async () => {
	titleHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ title: "Selected Tales from Chaucer" });
});
