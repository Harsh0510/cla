const path = require("path");

module.exports = class {
	setPdfThumbnailGenerator(gen) {
		this.pdfThumbnailGenerator = gen;
	}

	setHttpUploader(func) {
		this.httpUploader = func;
	}

	setFileUnlinker(unlinker) {
		this.fileUnlinker = unlinker;
	}

	async process(isbn13, pdfFile) {
		const thumbnailPath = path.join(`/tmp/cla-${isbn13}-thumbnail.png`);
		await this.pdfThumbnailGenerator(pdfFile, { width: 300, height: 300 }, thumbnailPath);
		const results = await this.httpUploader(isbn13, thumbnailPath);
		await this.fileUnlinker(thumbnailPath);
		return results;
	}
};
