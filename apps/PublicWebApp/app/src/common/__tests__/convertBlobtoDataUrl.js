import convertBlobtoDataUrl from "../convertBlobtoDataUrl";

let blob;

/**
 * Reset function
 */
function resetAll() {
	blob = new Blob();
}

beforeEach(resetAll);
afterEach(resetAll);

/** Function renders correctly */
test(`Function renders correctly`, async () => {
	const result = await convertBlobtoDataUrl(blob);
	expect(result).not.toEqual(null);
});
