const scottishLevelHandlers = require("../../../../core/admin/parseUploads/handlers/scottishLevel");
const parseXmlString = require("../../../common/parseXmlString");

test(`XML does not have a Scottish level`, async () => {
	const p = {};
	scottishLevelHandlers(p, await parseXmlString(`<Product></Product>`));
	expect(p).toEqual({ scottishLevel: [] });
});

test(`XML has single Scottish level`, async () => {
	const p = {};
	scottishLevelHandlers(
		p,
		await parseXmlString(`
		<Product>
			<DescriptiveDetail>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level (Scotland)</SubjectSchemeName>
					<SubjectHeadingText>Foo</SubjectHeadingText>
				</Subject>
			</DescriptiveDetail>
		</Product>
	`)
	);
	expect(p).toEqual({ scottishLevel: ["Foo"] });
});

test(`XML has single Scottish level (with non-Scottish levels)`, async () => {
	const p = {};
	scottishLevelHandlers(
		p,
		await parseXmlString(`
		<Product>
			<DescriptiveDetail>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Exam Board</SubjectSchemeName>
					<SubjectHeadingText>SQA</SubjectHeadingText>
				</Subject>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level (Scotland)</SubjectSchemeName>
					<SubjectHeadingText>Bar</SubjectHeadingText>
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
	expect(p).toEqual({ scottishLevel: ["Bar"] });
});

test(`XML has multiple Scottish levels and empty Scottish levels and values with whitespace and non-Scottish levels`, async () => {
	const p = {};
	scottishLevelHandlers(
		p,
		await parseXmlString(`
		<Product>
			<DescriptiveDetail>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level (Scotland)</SubjectSchemeName>
					<SubjectHeadingText>Testing</SubjectHeadingText>
				</Subject>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Exam Board</SubjectSchemeName>
					<SubjectHeadingText>SQA</SubjectHeadingText>
				</Subject>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level (Scotland)</SubjectSchemeName>
					<SubjectHeadingText>Bar</SubjectHeadingText>
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
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level (Scotland)</SubjectSchemeName>
					<SubjectHeadingText></SubjectHeadingText>
				</Subject>
				<Subject>
					<SubjectSchemeIdentifier>24</SubjectSchemeIdentifier>
					<SubjectSchemeName>CLA: Level (Scotland)</SubjectSchemeName>
					<SubjectHeadingText>
							Another
					</SubjectHeadingText>
				</Subject>
			</DescriptiveDetail>
		</Product>
	`)
	);
	expect(p).toEqual({ scottishLevel: ["Testing", "Bar", "Another"] });
});
