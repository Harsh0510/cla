const dummyGeneratePdfHighQualityImagesRaw = require("../../../../core/admin/lib/generatePdfHighQualityImages/dummyGeneratePdfHighQualityImages");
const path = require("path");

let pdfFilePath, outputDirectory, isbn13;

jest.mock(`../../../../core/admin/lib/getPdfPageCount/index`, () => {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(1);
		});
	};
});

async function dummyGeneratePdfHighQualityImages(pdfFilePath, isbn13, outputDirectory) {
	let result = null;
	try {
		result = await dummyGeneratePdfHighQualityImagesRaw(pdfFilePath, isbn13, outputDirectory);
	} catch (e) {
		result = e;
	}
	return result;
}

function resetAll() {
	pdfFilePath = "dummy_tmpGeneratePdfExtract_1.pdf";
	outputDirectory = path.join(__dirname, "..", "..", "lib", "dummyImages");
	isbn13 = "98765432100";
}

beforeEach(resetAll);
afterEach(resetAll);

test("Successful generate high quality pdf image file", async () => {
	const result = await dummyGeneratePdfHighQualityImages(pdfFilePath, isbn13, outputDirectory);
	expect(result[0].indexOf(["98765432100_generatePdfExtract_00001.png"])).not.toBe(-1);
});

test("Error when file path not correct while generate high quality pdf image file", async () => {
	outputDirectory = "/dummy";
	const result = await dummyGeneratePdfHighQualityImages(pdfFilePath, isbn13, outputDirectory);
	expect(result.toString().indexOf("no such file or directory")).not.toBe(-1);
});
