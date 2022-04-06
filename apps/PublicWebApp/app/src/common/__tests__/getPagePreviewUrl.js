import getPagePreviewUrl from "./../getPagePreviewUrl";

let isbn13, pageNumber, sasToken;

function resetAll() {
	isbn13 = "9870836489178";
	pageNumber = 1;
	sasToken = "Ses_Token";
}

beforeEach(resetAll);
afterEach(resetAll);

/** function renders correctly */
test("function renders correctly with ASSET_ORIGIN", async () => {
	process.env.ASSET_ORIGIN = "https://occclastagestorage.blob.core.windows.net";
	const item = getPagePreviewUrl(isbn13, pageNumber, sasToken);
	expect(item).toEqual("https://occclastagestorage.blob.core.windows.net/pagepreviews/9870836489178/0.png?Ses_Token");
});

test("function renders correctly with ASSET_ORIGIN and  isbn, pagenumber empty", async () => {
	isbn13 = "";
	pageNumber = "";
	process.env.ASSET_ORIGIN = "https://occclastagestorage.blob.core.windows.net";
	const item = getPagePreviewUrl(isbn13, pageNumber, sasToken);
	expect(item).toEqual("https://occclastagestorage.blob.core.windows.net/pagepreviews//-1.png?Ses_Token");
});
