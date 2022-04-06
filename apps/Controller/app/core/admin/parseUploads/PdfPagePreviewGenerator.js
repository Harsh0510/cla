const path = require("path");

module.exports = class {
	setPdfPagePreviewGenerator(gen) {
		this.pdfPagePreviewGenerator = gen;
	}

	setHttpUploader(func) {
		this.httpUploader = func;
	}

	setFileUnlinker(unlinker) {
		this.fileUnlinker = unlinker;
	}

	async process(isbn13, pdfFile) {
		const outputDirectory = path.join("/tmp");

		const watermarkPath = path.join(__dirname, "..", "lib", "generatePdfPagePreviews", "watermark.jpg");

		const outputs = await this.pdfPagePreviewGenerator(pdfFile, watermarkPath, isbn13, outputDirectory);
		const promises = outputs.map(async (previewPath) => {
			const parts = previewPath.match(/_tmp_([0-9]+)\.png$/);
			const num = parts[1];
			const result = await this.httpUploader(isbn13, previewPath, num);
			await this.fileUnlinker(previewPath);
			return result;
		});

		return await Promise.all(promises);
	}
};
