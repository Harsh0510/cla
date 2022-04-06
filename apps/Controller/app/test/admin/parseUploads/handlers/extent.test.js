const extentHandlers = require("../../../../core/admin/parseUploads/handlers/extent");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Extent>
							<ExtentType>06</ExtentType>
							<ExtentValue>320</ExtentValue>
							<ExtentUnit>03</ExtentUnit>
						</Extent>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any extent`, async () => {
	xmlValue = `<Product></Product>`;
	extentHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml 'ExtentType' except '5,6,11' and 'ExtentUnit' except '3'`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Extent>
							<ExtentType>15</ExtentType>
							<ExtentValue>620</ExtentValue>
							<ExtentUnit>02</ExtentUnit>
						</Extent>
					</DescriptiveDetail>
				</Product>
	`;
	extentHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml 'ExtentType' with '5'`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Extent>
							<ExtentType>05</ExtentType>
							<ExtentValue>620</ExtentValue>
							<ExtentUnit>03</ExtentUnit>
						</Extent>
					</DescriptiveDetail>
				</Product>
	`;
	extentHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ extent: 620 });
});

test(`Parse xml have extent`, async () => {
	extentHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ extent: 320 });
});
