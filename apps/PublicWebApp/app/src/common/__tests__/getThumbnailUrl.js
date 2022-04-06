import getThumbnailUrl from "./../getThumbnailUrl";

let isbn13;

function resetAll() {
	isbn13 = "9870836489178";
}

beforeEach(resetAll);
afterEach(resetAll);

/** function renders correctly with ASSET_ORIGIN */
test("function renders correctly with ASSET_ORIGIN", async () => {
	process.env.ASSET_ORIGIN = "https://occclastagestorage.blob.core.windows.net";
	const item = getThumbnailUrl(isbn13);
	expect(item).toEqual("https://occclastagestorage.blob.core.windows.net/coverpages/9870836489178.png");
});

/** function renders correctly with ASSET_ORIGIN and isbn empty */
test("function renders correctly with ASSET_ORIGIN and isbn empty", async () => {
	isbn13 = "";
	process.env.ASSET_ORIGIN = "https://occclastagestorage.blob.core.windows.net";
	const item = getThumbnailUrl(isbn13);
	expect(item).toEqual("https://occclastagestorage.blob.core.windows.net/coverpages/.png");
});
