const PdfPagePreviewGenerator = require("../../../core/admin/parseUploads/PdfPagePreviewGenerator");

const func = (_) => [5, 6];

test(`setting pdf page preview generator works`, async () => {
	const ie = new PdfPagePreviewGenerator();
	ie.setPdfPagePreviewGenerator(func);
	expect(ie.pdfPagePreviewGenerator).toBe(func);
});

test(`setting http uploader works`, async () => {
	const ie = new PdfPagePreviewGenerator();
	ie.setHttpUploader(func);
	expect(ie.httpUploader).toBe(func);
});

test(`setting file unlinker works`, async () => {
	const ie = new PdfPagePreviewGenerator();
	ie.setFileUnlinker(func);
	expect(ie.fileUnlinker).toBe(func);
});

test(`processing works`, async () => {
	const ie = new PdfPagePreviewGenerator();
	ie.setPdfPagePreviewGenerator(async (_) => ["/tmp/cla_tmp_100.png", "/tmp/cla_tmp_101.png"]);
	ie.setHttpUploader(async (isbn13, fp, num) => [isbn13, fp, num]);
	ie.setFileUnlinker(async (_) => 4);
	expect(await ie.process(123, "foo")).toEqual([
		[123, "/tmp/cla_tmp_100.png", "100"],
		[123, "/tmp/cla_tmp_101.png", "101"],
	]);
});
