const PdfPageHighQualityPageSlicer = require("../../../core/admin/parseUploads/PdfPageHighQualityPageSlicer");

const func = (_) => [5, 6];

test(`setting pdf high quality image generator works`, async () => {
	const item = new PdfPageHighQualityPageSlicer();
	item.setPdfHighQualityImageGenerator(func);
	expect(item.pdfHighQualityImageGenerator).toBe(func);
});

test(`setting http uploader works`, async () => {
	const item = new PdfPageHighQualityPageSlicer();
	item.setHttpUploader(func);
	expect(item.httpUploader).toBe(func);
});

test(`setting file unlinker works`, async () => {
	const item = new PdfPageHighQualityPageSlicer();
	item.setFileUnlinker(func);
	expect(item.fileUnlinker).toBe(func);
});

test(`processing works`, async () => {
	const item = new PdfPageHighQualityPageSlicer();
	item.setPdfHighQualityImageGenerator(async (_) => ["/tmp/_generatePdfExtract_100.png", "/tmp/_generatePdfExtract_101.png"]);
	item.setHttpUploader(async (isbn13, fp, num) => [isbn13, fp, num]);
	item.setFileUnlinker(async (_) => 4);
	expect(await item.process(123, "foo")).toEqual([123, "/tmp/_generatePdfExtract_100.png", "100"]);
});
