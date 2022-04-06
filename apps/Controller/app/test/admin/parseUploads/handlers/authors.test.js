const authorsHandlers = require("../../../../core/admin/parseUploads/handlers/authors");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Contributor>
							<SequenceNumber>1</SequenceNumber>
							<ContributorRole>A01</ContributorRole>
							<PersonName>Emily Dickinson</PersonName>
							<PersonNameInverted>Dickinson, Emily</PersonNameInverted>
							<NamesBeforeKey>Emily</NamesBeforeKey>
							<KeyNames>Dickinson</KeyNames>
							<BiographicalNote>Emily Dickinson (1830-86) was born in Amherst, Massachussetts, where she lived most of her life as a recluse, seldom leaving the house or receiving visitors. She published just a handful of poems in her lifetime, her first collection appearing posthumously in 1890.</BiographicalNote>
						</Contributor>
					</DescriptiveDetail>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml haven't any authors`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<NoContributor/>
					</DescriptiveDetail>
				</Product>
	`;
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ authors: [] });
});

test(`Parse xml without 'NamesBeforeKey & KeyNames'`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Contributor>
							<SequenceNumber>1</SequenceNumber>
							<ContributorRole>A01</ContributorRole>
							<PersonName>Emily Dickinson</PersonName>
							<PersonNameInverted>Dickinson, Emily</PersonNameInverted>
							<BiographicalNote>Emily Dickinson (1830-86) was born in Amherst, Massachussetts, where she lived most of her life as a recluse, seldom leaving the house or receiving visitors. She published just a handful of poems in her lifetime, her first collection appearing posthumously in 1890.</BiographicalNote>
						</Contributor>
					</DescriptiveDetail>
				</Product>
				`;
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ authors: [{ firstName: "Emily", lastName: "Dickinson", roleCode: "A01", sequenceNumber: 1 }] });
});

test(`Parse xml 'PersonName' not have last name value`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Contributor>
							<SequenceNumber>1</SequenceNumber>
							<ContributorRole>A01</ContributorRole>
							<PersonName>Emily</PersonName>
							<PersonNameInverted>Dickinson, Emily</PersonNameInverted>
							<BiographicalNote>Emily Dickinson (1830-86) was born in Amherst, Massachussetts, where she lived most of her life as a recluse, seldom leaving the house or receiving visitors. She published just a handful of poems in her lifetime, her first collection appearing posthumously in 1890.</BiographicalNote>
						</Contributor>
					</DescriptiveDetail>
				</Product>
				`;
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ authors: [{ firstName: "Emily", lastName: "", roleCode: "A01", sequenceNumber: 1 }] });
});

test(`Parse xml 'PersonName' empty node`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Contributor>
							<SequenceNumber>1</SequenceNumber>
							<ContributorRole>A01</ContributorRole>
							<PersonName></PersonName>
							<BiographicalNote>Emily Dickinson (1830-86) was born in Amherst, Massachussetts, where she lived most of her life as a recluse, seldom leaving the house or receiving visitors. She published just a handful of poems in her lifetime, her first collection appearing posthumously in 1890.</BiographicalNote>
						</Contributor>
					</DescriptiveDetail>
				</Product>
				`;
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ authors: [] });
});

test(`Parse xml without 'NamesBeforeKey, KeyNames and PersonName'`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Contributor>
							<SequenceNumber>1</SequenceNumber>
							<ContributorRole>A01</ContributorRole>
							<PersonNameInverted>Dickinson, Emily</PersonNameInverted>
							<BiographicalNote>Emily Dickinson (1830-86) was born in Amherst, Massachussetts, where she lived most of her life as a recluse, seldom leaving the house or receiving visitors. She published just a handful of poems in her lifetime, her first collection appearing posthumously in 1890.</BiographicalNote>
						</Contributor>
					</DescriptiveDetail>
				</Product>
				`;
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ authors: [{ firstName: "Emily", lastName: "Dickinson", roleCode: "A01", sequenceNumber: 1 }] });
});

test(`Parse xml without 'SequenceNumber'`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Contributor>
							<ContributorRole>A01</ContributorRole>
							<PersonNameInverted>Dickinson, Emily</PersonNameInverted>
							<BiographicalNote>Emily Dickinson (1830-86) was born in Amherst, Massachussetts, where she lived most of her life as a recluse, seldom leaving the house or receiving visitors. She published just a handful of poems in her lifetime, her first collection appearing posthumously in 1890.</BiographicalNote>
						</Contributor>
					</DescriptiveDetail>
				</Product>
				`;
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p.authors.sequenceNumber).not.toEqual(null);
});

test(`Parse xml 'PersonNameInverted' with empty`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Contributor>
							<SequenceNumber>1</SequenceNumber>
							<ContributorRole>A01</ContributorRole>
							<PersonNameInverted></PersonNameInverted>
							<BiographicalNote>Emily Dickinson (1830-86) was born in Amherst, Massachussetts, where she lived most of her life as a recluse, seldom leaving the house or receiving visitors. She published just a handful of poems in her lifetime, her first collection appearing posthumously in 1890.</BiographicalNote>
						</Contributor>
					</DescriptiveDetail>
				</Product>
				`;
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ authors: [] });
});

test(`Parse xml 'PersonNameInverted' single string value`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Contributor>
							<SequenceNumber>1</SequenceNumber>
							<ContributorRole>A01</ContributorRole>
							<PersonNameInverted>Dickinson ,</PersonNameInverted>
							<BiographicalNote>Emily Dickinson (1830-86) was born in Amherst, Massachussetts, where she lived most of her life as a recluse, seldom leaving the house or receiving visitors. She published just a handful of poems in her lifetime, her first collection appearing posthumously in 1890.</BiographicalNote>
						</Contributor>
					</DescriptiveDetail>
				</Product>
				`;
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ authors: [] });
});

test(`Parse xml 'SequenceNumber' node have null value`, async () => {
	xmlValue = `<Product>
					<DescriptiveDetail>
						<Contributor>
							<SequenceNumber></SequenceNumber>
							<ContributorRole>A01</ContributorRole>
							<PersonNameInverted>Dickinson, Emily</PersonNameInverted>
							<BiographicalNote>Emily Dickinson (1830-86) was born in Amherst, Massachussetts, where she lived most of her life as a recluse, seldom leaving the house or receiving visitors. She published just a handful of poems in her lifetime, her first collection appearing posthumously in 1890.</BiographicalNote>
						</Contributor>
					</DescriptiveDetail>
				</Product>
				`;
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p.authors.sequenceNumber).not.toEqual(null);
});

test(`Parse xml have authors`, async () => {
	authorsHandlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ authors: [{ firstName: "Emily", lastName: "Dickinson", roleCode: "A01", sequenceNumber: 1 }] });
});
