const PdfCoverThumbnailExtractor = require("../../../core/admin/parseUploads/PdfCoverThumbnailExtractor");

const func = (_) => 5;

test(`setting pdf thumbnail generator works`, async () => {
	const ie = new PdfCoverThumbnailExtractor();
	ie.setPdfThumbnailGenerator(func);
	expect(ie.pdfThumbnailGenerator).toBe(func);
});

test(`setting http uploader works`, async () => {
	const ie = new PdfCoverThumbnailExtractor();
	ie.setHttpUploader(func);
	expect(ie.httpUploader).toBe(func);
});

test(`setting file unlinker works`, async () => {
	const ie = new PdfCoverThumbnailExtractor();
	ie.setFileUnlinker(func);
	expect(ie.fileUnlinker).toBe(func);
});

test(`processing works`, async () => {
	const ie = new PdfCoverThumbnailExtractor();
	ie.setPdfThumbnailGenerator(async (_) => 1);
	ie.setHttpUploader(async (isbn13, fp) => [isbn13, fp]);
	ie.setFileUnlinker(async (_) => 4);
	expect(await ie.process(123, "foo")).toEqual([123, "/tmp/cla-123-thumbnail.png"]);
});
