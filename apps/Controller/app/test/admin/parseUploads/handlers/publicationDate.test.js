const publicationDateHandlers = require("../../../../core/admin/parseUploads/handlers/publicationDate");
const parseXmlString = require("../../../common/parseXmlString");

let p;

function resetAll() {
	p = {};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any publicationDate`, async () => {
	publicationDateHandlers(p, await parseXmlString(`<Product></Product>`));
	expect(p).toEqual({});
});

test(`Parse xml with publicationDate (8 digits)`, async () => {
	const xmlValue = `<Product>
					<PublishingDetail>
						<PublishingDate>
							<PublishingDateRole>01</PublishingDateRole>
							<Date>20170612</Date>
						</PublishingDate>
					</PublishingDetail>
				</Product>
	`;
	publicationDateHandlers(p, await parseXmlString(xmlValue));
	// 12th June 2017
	expect(p).toEqual({ publicationDate: 1497225600 });
});

test(`Parse xml with publicationDate (6 digits)`, async () => {
	const xmlValue = `<Product>
					<PublishingDetail>
						<PublishingDate>
							<PublishingDateRole>01</PublishingDateRole>
							<Date>201706</Date>
						</PublishingDate>
					</PublishingDetail>
				</Product>
	`;
	publicationDateHandlers(p, await parseXmlString(xmlValue));

	// 1st June 2017
	expect(p).toEqual({ publicationDate: 1496275200 });
});

test(`Parse xml with publicationDate (4 digits)`, async () => {
	const xmlValue = `<Product>
					<PublishingDetail>
						<PublishingDate>
							<PublishingDateRole>01</PublishingDateRole>
							<Date>2017</Date>
						</PublishingDate>
					</PublishingDetail>
				</Product>
	`;
	publicationDateHandlers(p, await parseXmlString(xmlValue));
	// 1st January 2017
	expect(p).toEqual({ publicationDate: 1483228800 });
});

test(`Parse xml with publicationDate (8 digits - not just digits)`, async () => {
	const xmlValue = `<Product>
					<PublishingDetail>
						<PublishingDate>
							<PublishingDateRole>01</PublishingDateRole>
							<Date>2017-06-12</Date>
						</PublishingDate>
					</PublishingDetail>
				</Product>
	`;
	publicationDateHandlers(p, await parseXmlString(xmlValue));
	// 12th June 2017
	expect(p).toEqual({ publicationDate: 1497225600 });
});
