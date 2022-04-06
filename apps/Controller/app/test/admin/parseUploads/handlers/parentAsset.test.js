const handler = require("../../../../core/admin/parseUploads/handlers/parentAsset");
const parseXmlString = require("../../../common/parseXmlString");

test(`Parse parentAsset`, async () => {
	const p = {};
	handler(
		p,
		await parseXmlString(`
		<Product>
			<DescriptiveDetail>
				<Collection>
					<CollectionType>10</CollectionType>
					<CollectionIdentifier>
						<CollectionIDType>02</CollectionIDType>
						<IDTypeName>ISSN</IDTypeName>
						<IDValue>1469-8552</IDValue>
					</CollectionIdentifier>
					<TitleDetail>
						<TitleType>02</TitleType>
						<TitleElement>
							<SequenceNumber>1</SequenceNumber>
							<TitleElementLevel>01</TitleElementLevel>
							<TitleText>BBC History Magazine</TitleText>
						</TitleElement>
						<TitleStatement>   BBC History Magazine 123   </TitleStatement>
					</TitleDetail>
				</Collection>
			</DescriptiveDetail>
		</Product>
	`)
	);
	expect(p).toEqual({
		parentAsset: {
			identifier: `1469-8552`,
			title: `BBC History Magazine 123`,
		},
	});
});

test(`No parent identifier`, async () => {
	const p = {};
	handler(
		p,
		await parseXmlString(`
		<Product>
			<DescriptiveDetail>
				<Collection>
					<CollectionType>10</CollectionType>
					<CollectionIdentifier>
						<!-- !!!!!!!!!!!!!!!!!! Invalid CollectionIDType  -->
						<CollectionIDType>05</CollectionIDType>
						<IDTypeName>ISSN</IDTypeName>
						<IDValue>1469-8552</IDValue>
					</CollectionIdentifier>
					<TitleDetail>
						<TitleType>02</TitleType>
						<TitleElement>
							<SequenceNumber>1</SequenceNumber>
							<TitleElementLevel>01</TitleElementLevel>
							<TitleText>BBC History Magazine</TitleText>
						</TitleElement>
						<TitleStatement>BBC History Magazine</TitleStatement>
					</TitleDetail>
				</Collection>
			</DescriptiveDetail>
		</Product>
	`)
	);
	expect(p).toEqual({
		parentAsset: {
			title: `BBC History Magazine`,
		},
	});
});

test(`No parent title`, async () => {
	const p = {};
	handler(
		p,
		await parseXmlString(`
		<Product>
			<DescriptiveDetail>
				<Collection>
					<CollectionType>10</CollectionType>
					<CollectionIdentifier>
						<CollectionIDType>01</CollectionIDType>
						<IDTypeName>ISSN</IDTypeName>
						<IDValue>
							1469-8552
						</IDValue>
					</CollectionIdentifier>
					<TitleDetail>
						<!-- !!!!!!!!!!!!!!!!!! Invalid TitleType  -->
						<TitleType>09</TitleType>
						<TitleElement>
							<SequenceNumber>1</SequenceNumber>
							<TitleElementLevel>01</TitleElementLevel>
							<TitleText>BBC History Magazine</TitleText>
						</TitleElement>
						<TitleStatement>BBC History Magazine</TitleStatement>
					</TitleDetail>
				</Collection>
			</DescriptiveDetail>
		</Product>
	`)
	);
	expect(p).toEqual({
		parentAsset: {
			identifier: `1469-8552`,
		},
	});
});

test(`No parent details at all`, async () => {
	const p = {};
	handler(
		p,
		await parseXmlString(`
		<Product>
			<DescriptiveDetail>
				<Collection>
					<CollectionType>10</CollectionType>
					<CollectionIdentifier>
						<CollectionIDType>01</CollectionIDType>
						<IDTypeName>ISSN</IDTypeName>
					</CollectionIdentifier>
					<TitleDetail>
						<TitleType>01</TitleType>
						<TitleElement>
							<SequenceNumber>1</SequenceNumber>
							<TitleElementLevel>01</TitleElementLevel>
							<TitleText>BBC History Magazine</TitleText>
						</TitleElement>
					</TitleDetail>
				</Collection>
			</DescriptiveDetail>
		</Product>
	`)
	);
	expect(p).toEqual({
		parentAsset: {},
	});
});

test(`When node inner text null`, async () => {
	const p = {};
	handler(p, {
		queryOne: () => {
			return {
				getInnerText: () => {
					return null;
				},
			};
		},
	});
	expect(p).toEqual({
		parentAsset: {
			identifier: ``,
			title: "",
		},
	});
});
