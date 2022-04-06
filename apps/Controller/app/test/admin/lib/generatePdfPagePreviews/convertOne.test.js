const convertOne = require("../../../../core/admin/lib/generatePdfPagePreviews/convertOne");
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
	let png = "_pagepreviews_tmp_1.png",
		outputDirectory = "/dir1",
		isbn13 = "123214f";
	let watermarkPath = "generatePdfPagePreviews/watermark.png";
	const result = await convertOne(mockmagickBinaryPath, png, outputDirectory, isbn13, watermarkPath);
	expect(result).toEqual("/dir1/123214f_pagepreviews_1.png");
});

test("Convert resize png image when applyBlur is set", async () => {
	let png = "_pagepreviews_tmp_1.png",
		outputDirectory = "/dir1",
		isbn13 = "123214f";
	let watermarkPath = "generatePdfPagePreviews/watermark.png";
	const result = await convertOne(mockmagickBinaryPath, png, outputDirectory, isbn13, watermarkPath, true);
	expect(result).toEqual("/dir1/123214f_pagepreviews_1.png");
});
