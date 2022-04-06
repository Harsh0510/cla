const productErrorCheck = require("../../../core/admin/parseUploads/productErrorCheck");

function getGoodProduct() {
	return {
		recordReference: "anc",
		isbn13: "1234567890abc",
		title: "the title",
		edition: 1,
		authors: [
			{
				firstName: "first",
				lastName: "last",
			},
			{
				firstName: "alan",
				lastName: "johnson",
			},
		],
		extent: 150,
		publicationDate: 123456789,
		subject: "AB",
		rightsPermitted: ["GB", "US"],
		rightsNotPermitted: ["ES"],
		toc: `<ul><li>A random title</li></ul>`,
		pdfFile: "/path/to/file.pdf",
		pdfIsbn13: "1234567890abc",
		issnId: "1234567890abc",
	};
}

// test('no record reference', async () => {
// 	const product = getGoodProduct();
// 	delete product.recordReference;
// 	expect(productErrorCheck(product)).toEqual(['Record Reference not found']);
// });

test("no isbn13", async () => {
	const product = getGoodProduct();
	delete product.issnId;
	delete product.isbn13;
	expect(productErrorCheck(product)).toEqual(["Print ISBN13 not found", "ISSN ID not found"]);
});

test("no title", async () => {
	const product = getGoodProduct();
	delete product.title;
	expect(productErrorCheck(product)).toEqual(["Title not found"]);
});

test("no authors (<NoContributor/> found)", async () => {
	const product = getGoodProduct();
	product.authors = null;
	expect(productErrorCheck(product)).toEqual([]);
});

// test('empty authors', async () => {
// 	const product = getGoodProduct();
// 	product.authors = [];
// 	expect(productErrorCheck(product)).toEqual(['Authors not found (and no <NoContributor/> element found)']);
// });

// test('no extent', async () => {
// 	const product = getGoodProduct();
// 	delete product.extent;
// 	expect(productErrorCheck(product)).toEqual(['Extent not found']);
// });

// test('no publication date', async () => {
// 	const product = getGoodProduct();
// 	delete product.publicationDate;
// 	expect(productErrorCheck(product)).toEqual(['Publication Date not found']);
// });

// test('no subject', async () => {
// 	const product = getGoodProduct();
// 	delete product.subject;
// 	expect(productErrorCheck(product)).toEqual(['Subject not found']);
// });

test("no rights permitted (which is ok!)", async () => {
	const product = getGoodProduct();
	product.rightsPermitted = [];
	expect(productErrorCheck(product)).toEqual([]);
});

test("no rights not permitted (which is ok!)", async () => {
	const product = getGoodProduct();
	product.rightsNotPermitted = [];
	expect(productErrorCheck(product)).toEqual([]);
});

test("no toc (which is ok!)", async () => {
	const product = getGoodProduct();
	delete product.toc;
	expect(productErrorCheck(product)).toEqual([]);
});

test("multiple errors", async () => {
	const product = getGoodProduct();
	delete product.title;
	delete product.pdfFile;
	expect(productErrorCheck(product)).toEqual(["Title not found"]);
});

test("all okay", async () => {
	const product = getGoodProduct();
	expect(productErrorCheck(product)).toEqual([]);
});

test("no pdfIsbn13", async () => {
	const product = getGoodProduct();
	delete product.issnId;
	delete product.pdfIsbn13;
	expect(productErrorCheck(product)).toEqual(["PDF ISBN13 not found", "ISSN ID not found"]);
});
