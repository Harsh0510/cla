const getAssetFormatTitle = require("../../common/getAssetFormatTitle");

let contentForm;

function resetAll() {
	contentForm = {
		book: "BO",
		magazine: "MI",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return AssetFormateTitle book when contentForm BO`, async () => {
	const item = getAssetFormatTitle(contentForm.book);
	expect(item).toEqual("Book");
});

test(`Return AssetFormateTitle magazine when contentForm MI`, async () => {
	const item = getAssetFormatTitle(contentForm.magazine);
	expect(item).toEqual("Magazine");
});
