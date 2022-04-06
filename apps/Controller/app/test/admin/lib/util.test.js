const util = require("../../../core/admin/lib/util");

describe("util.getFlattenedProducts", () => {
	test("empty array", async () => {
		expect(util.getFlattenedProducts([])).toEqual([]);
	});
	test("single product (no errors)", async () => {
		const products = [
			{
				errors: [],
				products: [
					{
						pdfIsbn13: "product 1",
						errors: [],
					},
				],
			},
		];
		expect(util.getFlattenedProducts(products)).toEqual([{ pdfIsbn13: "product 1" }]);
	});
	test("multiple products (no errors)", async () => {
		const products = [
			{
				errors: [],
				products: [
					{
						pdfIsbn13: "product 1",
						errors: [],
					},
					{
						pdfIsbn13: "product 2",
						errors: [],
					},
				],
			},
			{
				errors: [],
				products: [
					{
						pdfIsbn13: "product 3",
						errors: [],
					},
					{
						pdfIsbn13: "product 4",
						errors: [],
					},
				],
			},
		];
		expect(util.getFlattenedProducts(products)).toEqual([
			{
				pdfIsbn13: "product 1",
			},
			{
				pdfIsbn13: "product 2",
			},
			{
				pdfIsbn13: "product 3",
			},
			{
				pdfIsbn13: "product 4",
			},
		]);
	});
	test("multiple products (some with errors)", async () => {
		const products = [
			{
				errors: ["some error"],
				products: [
					{
						pdfIsbn13: "product 1",
						errors: [],
					},
					{
						pdfIsbn13: "product 2",
						errors: [],
					},
				],
			},
			{
				errors: [],
				products: [
					{
						pdfIsbn13: "product 3",
						errors: [],
					},
					{
						pdfIsbn13: "product 4",
						errors: ["another product"],
					},
				],
			},
		];
		expect(util.getFlattenedProducts(products)).toEqual([
			{
				pdfIsbn13: "product 3",
			},
		]);
	});
});

describe("util.getFlattenedProductsRaw", () => {
	test("empty array", async () => {
		expect(util.getFlattenedProductsRaw([])).toEqual([]);
	});
	test("single product no errors", async () => {
		const products = [
			{
				errors: [],
				products: [
					{
						pdfIsbn13: "9876543210001",
						errors: [],
					},
				],
			},
		];
		expect(util.getFlattenedProductsRaw(products)).toEqual([{ pdfIsbn13: "9876543210001" }]);
	});

	test("Multi product (no errors)", async () => {
		const products = [
			{
				errors: [],
				products: [
					{
						pdfIsbn13: "9876543210001",
						errors: [],
					},
					{
						pdfIsbn13: "9876543210002",
						errors: [],
					},
				],
			},
		];
		expect(util.getFlattenedProductsRaw(products)).toEqual([
			{
				pdfIsbn13: "9876543210001",
			},
			{
				pdfIsbn13: "9876543210002",
			},
		]);
	});

	test("Invalid product (no errors)", async () => {
		const products = [
			{
				errors: [],
				products: "Test",
			},
		];
		expect(util.getFlattenedProductsRaw(products)).toEqual([]);
	});
});

describe("util.getErrorsOnly", () => {
	test("empty array", async () => {
		expect(util.getErrorsOnly([])).toEqual([]);
	});

	test("single product without errors", async () => {
		const products = [
			{
				errors: [],
				products: [
					{
						title: "Test1",
						pdfIsbn13: "9876543210001",
						errors: [],
					},
				],
			},
		];
		expect(util.getErrorsOnly(products)).toEqual([]);
	});

	test("single product (with errors)", async () => {
		const products = [
			{
				errors: ["error1"],
				products: [
					{
						title: "Test1",
						pdfIsbn13: "9876543210001",
						errors: ["Product error1"],
					},
				],
			},
		];
		expect(util.getErrorsOnly(products)).toEqual([
			{
				data: {
					errors: ["error1"],
				},
				type: "xml_file_error",
			},
		]);
	});

	test("single product (with errors)", async () => {
		const products = [
			{
				errors: [],
				products: [
					{
						title: "Test1",
						isbn13: "abc123",
						pdfIsbn13: "abc123",
						issnId: "abc123",
						errors: ["Product error1"],
					},
					{
						title: "Test2",
						isbn13: "abcd",
						pdfIsbn13: "efgh",
						errors: [],
						errors: ["Product error2"],
					},
				],
			},
		];
		expect(util.getErrorsOnly(products)).toEqual([
			{
				type: "product_error",
				xml: { errors: [] },
				issnId: "abc123",
				isbn13: "abc123",
				pdfIsbn13: "abc123",
				title: "Test1",
				errors: ["Product error1"],
			},
			{
				type: "product_error",
				xml: { errors: [] },
				isbn13: "abcd",
				pdfIsbn13: "efgh",
				title: "Test2",
				errors: ["Product error2"],
			},
		]);
	});
});
