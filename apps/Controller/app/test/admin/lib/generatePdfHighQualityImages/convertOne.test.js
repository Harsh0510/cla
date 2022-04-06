const convertOne = require("../../../../core/admin/lib/generatePdfHighQualityImages/convertOne");
const mockmagickBinaryPath = __dirname;

jest.mock(`../../../../core/admin/lib/execPromise`, () => {
	return async function () {
		new Promise((res, rej) => {
			res(true);
		});
	};
});

jest.mock(`../../../../core/admin/lib/execFilePromise`, () => {
	return async function () {
		new Promise((res, rej) => {
			res(true);
		});
	};
});

test("Convert resize png image", async () => {
	let png = "dummy_tmpGeneratePdfExtract_1.png",
		outputDirectory = "/dir1",
		isbn13 = "123214f";
	const result = await convertOne(mockmagickBinaryPath, png, outputDirectory, isbn13);
	expect(result).toEqual("/dir1/123214f_generatePdfExtract_1.png");
});
