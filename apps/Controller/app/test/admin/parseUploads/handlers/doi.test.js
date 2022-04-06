const doi = require("../../../../core/admin/parseUploads/handlers/doi");
const parseXmlString = require("../../../common/parseXmlString");

test(`Parse xml without any doi 1`, async () => {
	const p = {};
	doi(p, await parseXmlString(`<Product></Product>`));
	expect(p).toEqual({});
});

test(`Parse xml without any doi 2`, async () => {
	const p = {};
	doi(
		p,
		await parseXmlString(`
		<Product>
			<ProductIdentifier>
				<ProductIDType>06</ProductIDType>
				<IDValue></IDValue>
			</ProductIdentifier>
		</Product>
	`)
	);
	expect(p).toEqual({});
});

test(`Parse xml with valid doi`, async () => {
	const p = {};
	doi(
		p,
		await parseXmlString(`
		<Product>
			<ProductIdentifier>
				<ProductIDType>06</ProductIDType>
				<IDValue>
					10.1057/978-1-137-61146-8
				</IDValue>
			</ProductIdentifier>
		</Product>
	`)
	);
	expect(p).toEqual({ doi: "10.1057/978-1-137-61146-8" });
});

test("Parse xml with only empty spaces for doi", async () => {
	const p = {};
	doi(
		p,
		await parseXmlString(`
		<Product>
			<ProductIdentifier>
				<ProductIDType>06</ProductIDType>
				<IDValue>
					



				</IDValue>
			</ProductIdentifier>
		</Product>
	`)
	);
	expect(p).toEqual({});
});
