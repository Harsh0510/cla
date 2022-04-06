const subtitleHandlers = require("../../../../core/admin/parseUploads/handlers/subtitle");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
					<TitleDetail>
						<TitleType>01</TitleType>
						<TitleElement>
							<TitleElementLevel>01</TitleElementLevel>
							<TitleText>GCSE Religious Studies for AQA A: Buddhism</TitleText>
							<Subtitle>Christianity, Philosophy and Ethics</Subtitle>
						</TitleElement>
						<TitleStatement>GCSE Religious Studies for AQA A: Buddhism</TitleStatement>
					</TitleDetail>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any subtitle`, async () => {
	xmlValue = `<Product></Product>`;
	subtitleHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml have subtitle`, async () => {
	subtitleHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ subtitle: "Christianity, Philosophy and Ethics" });
});
