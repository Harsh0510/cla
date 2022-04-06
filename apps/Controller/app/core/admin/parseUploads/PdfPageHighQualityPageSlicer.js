const path = require("path");

module.exports = class {
	setPdfHighQualityImageGenerator(gen) {
		this.pdfHighQualityImageGenerator = gen;
	}

	setHttpUploader(func) {
		this.httpUploader = func;
	}

	setFileUnlinker(unlinker) {
		this.fileUnlinker = unlinker;
	}

	async process(isbn13, pdfFile) {
		const outputDirectory = path.join("/tmp");

		const outputs = await this.pdfHighQualityImageGenerator(pdfFile, isbn13, outputDirectory);
		const promises = outputs.map(async (imagePath) => {
			const parts = imagePath.match(/_generatePdfExtract_([0-9]+)\.png$/);
			const num = parts[1];
			const result = await this.httpUploader(isbn13, imagePath, num);
			await this.fileUnlinker(imagePath);
			return result;
		});

		const results = await Promise.all(promises);

		return results[0];
	}
};
