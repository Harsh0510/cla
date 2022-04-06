const path = require("path");
const dummyGeneratePdfThumbnail = require(`../../../core/admin/lib/dummyGeneratePdfThumbnail`);

let pdfFilePath, thumbnailSize, thumbnailOutputPath, mockError;
function resetAll() {
	pdfFilePath = null;
	thumbnailSize = null;
	thumbnailOutputPath = path.join(__dirname, "dummyImages", "dummyGeneratePdfThumbnail.png");
	mockDummyImagePath = "dummyImages";
	mockError = null;
}

/** Mock for copyFile */
jest.mock(`../../../core/admin/lib/copyFile`, () => {
	return function (dummyThumbnailPath, thumbnailOutputPath, callBack) {
		callBack(mockError);
	};
});

beforeEach(resetAll);
afterEach(resetAll);

test(`Error when file does not exist`, () => {
	mockError = "file does not exist";
	let funResult = null,
		error = null;
	dummyGeneratePdfThumbnail(pdfFilePath, thumbnailSize, thumbnailOutputPath)
		.then((result) => (funResult = result))
		.catch((err) => (error = err))
		.finally(() => {
			expect(error).toEqual(mockError);
			expect(funResult).toBeNull();
		});
});

test(`Success when file exist`, () => {
	let funResult = null,
		error = null;
	dummyGeneratePdfThumbnail(pdfFilePath, thumbnailSize, thumbnailOutputPath)
		.then((result) => (funResult = result))
		.catch((err) => (error = err))
		.finally(() => {
			expect(error).toEqual(null);
			expect(funResult).toEqual(undefined);
		});
});
