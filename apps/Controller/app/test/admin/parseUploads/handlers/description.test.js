const descriptionHandlers = require("../../../../core/admin/parseUploads/handlers/description");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<CollateralDetail>
						<TextContent>
							<TextType>01</TextType>
							<ContentAudience>00</ContentAudience>
							<Text>The classic respected series in a stunning new design. This edition of The Wife of Bath's Prologue and Tale from the highly-respected Selected Tales series includes the full, complete text in the original Middle English, along with an in-depth introduction by James Winny, detailed notes and a comprehensive glossary.</Text>
						</TextContent>
					</CollateralDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any description`, async () => {
	xmlValue = `<Product></Product>`;
	descriptionHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml have description`, async () => {
	descriptionHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({
		description: `The classic respected series in a stunning new design. This edition of The Wife of Bath's Prologue and Tale from the highly-respected Selected Tales series includes the full, complete text in the original Middle English, along with an in-depth introduction by James Winny, detailed notes and a comprehensive glossary.`,
	});
});
