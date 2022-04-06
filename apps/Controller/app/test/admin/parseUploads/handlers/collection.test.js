const collectionHandler = require("../../../../core/admin/parseUploads/handlers/collection");
const parseXmlString = require("../../../common/parseXmlString");

test(`XML does not have a Collection`, async () => {
	const p = {};
	collectionHandler(p, await parseXmlString(`<Product></Product>`));
	expect(p).toEqual({ collection: [] });
});

test(`XML has single Collection`, async () => {
	const p = {};
	collectionHandler(
		p,
		await parseXmlString(`
			<Product>
				<DescriptiveDetail>
					<!--element generated by CLA via transformation at 2021-10-14T12:43:52.706181Z-->
					<Subject>
						<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
						<SubjectSchemeName>CLA: Collection</SubjectSchemeName>
						<SubjectCode>BHM</SubjectCode>
						<SubjectHeadingText>Black History</SubjectHeadingText>
					</Subject>
				</DescriptiveDetail>
			</Product>
	`)
	);
	expect(p).toEqual({ collection: ["Black History"] });
});

test(`XML has single Collection (with non-Collections)`, async () => {
	const p = {};
	collectionHandler(
		p,
		await parseXmlString(`
		<Product>
			<DescriptiveDetail>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Exam Board</SubjectSchemeName>
					<SubjectHeadingText>SQA</SubjectHeadingText>
				</Subject>
				<!--element generated by CLA via transformation at 2021-10-14T12:43:52.706181Z-->
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Collection</SubjectSchemeName>
					<SubjectCode>BHM</SubjectCode>
					<SubjectHeadingText>Foo Bar</SubjectHeadingText>
				</Subject>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level (Another one)</SubjectSchemeName>
					<SubjectHeadingText>Should be ignored</SubjectHeadingText>
				</Subject>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level</SubjectSchemeName>
					<SubjectHeadingText>Secondary</SubjectHeadingText>
				</Subject>
			</DescriptiveDetail>
		</Product>
	`)
	);
	expect(p).toEqual({ collection: ["Foo Bar"] });
});

test(`XML has multiple Collections and empty Collections and values with whitespace and non-Collections`, async () => {
	const p = {};
	collectionHandler(
		p,
		await parseXmlString(`
		<Product>
			<DescriptiveDetail>
				<!--element generated by CLA via transformation at 2021-10-14T12:43:52.706181Z-->
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Collection</SubjectSchemeName>
					<SubjectCode>BHM2</SubjectCode>
					<SubjectHeadingText>Black History</SubjectHeadingText>
				</Subject>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Exam Board</SubjectSchemeName>
					<SubjectHeadingText>SQA</SubjectHeadingText>
				</Subject>
				<!--element generated by CLA via transformation at 2021-10-14T12:43:52.706181Z-->
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Collection</SubjectSchemeName>
					<SubjectCode>BHM</SubjectCode>
					<SubjectHeadingText>Black History 2</SubjectHeadingText>
				</Subject>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level (Another one)</SubjectSchemeName>
					<SubjectHeadingText>Should be ignored</SubjectHeadingText>
				</Subject>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level</SubjectSchemeName>
					<SubjectHeadingText>Secondary</SubjectHeadingText>
				</Subject>
				<!--element generated by CLA via transformation at 2021-10-14T12:43:52.706181Z-->
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Collection</SubjectSchemeName>
					<SubjectCode>BHM</SubjectCode>
					<SubjectHeadingText></SubjectHeadingText>
				</Subject>
				<!--element generated by CLA via transformation at 2021-10-14T12:43:52.706181Z-->
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Collection</SubjectSchemeName>
					<SubjectCode>BHM</SubjectCode>
					<SubjectHeadingText>
						Another
					</SubjectHeadingText>
				</Subject>
			</DescriptiveDetail>
		</Product>
	`)
	);
	expect(p).toEqual({ collection: ["Black History", "Black History 2", "Another"] });
});