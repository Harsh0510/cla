const dummyGeneratePdfPagePreviewsRaw = require("../../../../core/admin/lib/generatePdfPagePreviews/dummyGeneratePdfPagePreviews");
const path = require("path");

let pdfFilePath, outputDirectory, isbn13, watermarkImagePath;

jest.mock(`../../../../core/admin/lib/getPdfPageCount/index`, () => {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(1);
		});
	};
});

async function dummyGeneratePdfPagePreview(pdfFilePath, watermarkImagePath, isbn13, outputDirectory) {
	let result = null;
	try {
		result = await dummyGeneratePdfPagePreviewsRaw(pdfFilePath, watermarkImagePath, isbn13, outputDirectory);
	} catch (e) {
		result = e;
	}
	return result;
}

function resetAll() {
	pdfFilePath = path.join(__dirname, "input.pdf");
	outputDirectory = path.join(__dirname, "..", "..", "lib", "dummyImages");
	isbn13 = "98765432101";
	watermarkImagePath = path.join(__dirname, "..", "..", "..", "core", "admin", "lib", "generatePdfPagePreviews", "watermark.png");
}

beforeEach(resetAll);
afterEach(resetAll);

test("Successful generate high quality pdf image file", async () => {
	const result = await dummyGeneratePdfPagePreview(pdfFilePath, watermarkImagePath, isbn13, outputDirectory);
	expect(result[0].indexOf(["98765432101_pagepreviews_00001.png"])).not.toBe(-1);
});

test("Error when file path not correct while generate high quality pdf image file", async () => {
	outputDirectory = "/dummy";
	const result = await dummyGeneratePdfPagePreview(pdfFilePath, watermarkImagePath, isbn13, outputDirectory);
	expect(result.toString().indexOf("no such file or directory")).not.toBe(-1);
});
