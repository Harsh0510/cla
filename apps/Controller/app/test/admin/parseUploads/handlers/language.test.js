const handler = require("../../../../core/admin/parseUploads/handlers/language");
const parseXmlString = require("../../../common/parseXmlString");

test(`Parse xml without any language`, async () => {
	const p = {};
	const xmlValue = `<Product></Product>`;
	handler(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ language: ["eng"] });
});

test(`Parse xml with single language`, async () => {
	const p = {};
	const xmlValue = `
		<Product>
			<DescriptiveDetail>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>wel</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
			</DescriptiveDetail>
		</Product>
	`;
	handler(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ language: ["wel"] });
});

test(`Parse xml with multiple languages`, async () => {
	const p = {};
	const xmlValue = `
		<Product>
			<DescriptiveDetail>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>wel</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>eng</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
			</DescriptiveDetail>
		</Product>
	`;
	handler(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ language: ["eng", "wel"] });
});

test(`Ignore duplicate languages`, async () => {
	const p = {};
	const xmlValue = `
		<Product>
			<DescriptiveDetail>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>wel</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>wel</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>eng</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
			</DescriptiveDetail>
		</Product>
	`;
	handler(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ language: ["eng", "wel"] });
});

test(`Unknown languages should be treated as English`, async () => {
	const p = {};
	const xmlValue = `
		<Product>
			<DescriptiveDetail>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>wel</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>foo</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
			</DescriptiveDetail>
		</Product>
	`;
	handler(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ language: ["eng", "wel"] });
});

test(`Ignore empty languages`, async () => {
	const p = {};
	const xmlValue = `
		<Product>
			<DescriptiveDetail>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>wel</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode></LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
			</DescriptiveDetail>
		</Product>
	`;
	handler(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ language: ["wel"] });
});

test(`Ignore empty languages (post trimming)`, async () => {
	const p = {};
	const xmlValue = `
		<Product>
			<DescriptiveDetail>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>wel</LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
				<Language>
					<LanguageRole>01</LanguageRole>
					<LanguageCode>         </LanguageCode>
					<CountryCode>GB</CountryCode>
				</Language>
			</DescriptiveDetail>
		</Product>
	`;
	handler(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ language: ["wel"] });
});
