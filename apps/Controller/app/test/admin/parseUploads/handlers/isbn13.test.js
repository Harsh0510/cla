const isbn13Handlers = require("../../../../core/admin/parseUploads/handlers/isbn13");
const parseXmlString = require("../../../common/parseXmlString");

let p, xmlValue;

function resetAll() {
	p = {};
	xmlValue = `<Product>
					<ProductIdentifier>
						<ProductIDType>15</ProductIDType>
						<IDValue>9781108447423</IDValue>
					</ProductIdentifier>
					
					<DescriptiveDetail>
						<ProductForm>EA</ProductForm>
					</DescriptiveDetail>

					<RelatedMaterial>
						<RelatedWork>
							<WorkRelationCode>01</WorkRelationCode>
							<WorkIdentifier>
								<WorkIDType>15</WorkIDType>
								<IDValue>9781316615607</IDValue>
							</WorkIdentifier>
						</RelatedWork>
					</RelatedMaterial>
				</Product>
	`;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Parse xml without any isbn13`, async () => {
	xmlValue = `<Product></Product>`;
	isbn13Handlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({});
});

test(`Parse xml have product isbn13 with form BS`, async () => {
	xmlValue = `<Product>
					<ProductIdentifier>
						<ProductIDType>15</ProductIDType>
						<IDValue>9781108447423</IDValue>
					</ProductIdentifier>
					
					<DescriptiveDetail>
						<ProductForm>BS</ProductForm>
					</DescriptiveDetail>

					<RelatedMaterial>
						<RelatedWork>
							<WorkRelationCode>01</WorkRelationCode>
							<WorkIdentifier>
								<WorkIDType>15</WorkIDType>
								<IDValue>9781316615607</IDValue>
							</WorkIdentifier>
						</RelatedWork>
					</RelatedMaterial>
				</Product>
	`;
	isbn13Handlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ isbn13: "9781108447423" });
});

test(`Parse xml have product form start with E`, async () => {
	isbn13Handlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ isbn13: "9781316615607" });
});

test(`Parse xml have product with IDTypeName is CLA: publisher-supplied digital ISBN`, async () => {
	xmlValue = `<Product>
				<ProductIdentifier>
					<ProductIDType>01</ProductIDType>
					<IDTypeName>CLA: publisher-supplied digital ISBN</IDTypeName>
					<IDValue>9781108447423</IDValue>
				</ProductIdentifier>
			</Product>
			`;

	isbn13Handlers(p, await parseXmlString(xmlValue));
	expect(p).toEqual({ isbn13: "9781108447423" });
});

test(`Parse xml with multiple isbns`, async () => {
	const xml = `
		<Product>
			<DescriptiveDetail>
				<ProductForm>EA</ProductForm>
			</DescriptiveDetail>

			<RelatedMaterial>
				<RelatedProduct>
					<ProductRelationCode>06</ProductRelationCode>
					<ProductForm>B</ProductForm>
					<ProductIdentifier>
						<ProductIDType>15</ProductIDType>
						<IDValue>bar</IDValue>
					</ProductIdentifier>
				</RelatedProduct>
				<RelatedProduct>
					<ProductRelationCode>13</ProductRelationCode>
					<ProductForm>B</ProductForm>
					<ProductIdentifier>
						<ProductIDType>15</ProductIDType>
						<IDValue>foo</IDValue>
					</ProductIdentifier>
				</RelatedProduct>
			</RelatedMaterial>
		</Product>
	`;
	const p = {};
	isbn13Handlers(p, await parseXmlString(xml));
	expect(p).toEqual({ isbn13: "bar", alternateIsbn13: "foo" });
});
