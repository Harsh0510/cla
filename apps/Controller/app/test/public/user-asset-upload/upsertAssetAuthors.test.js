const upsertAssetAuthorsRaw = require("../../../core/public/user-asset-upload/upsertAssetAuthors");

let querier;
let currUserId;
let assetId;

function resetAll() {
	querier = () => {};
	currUserId = 12345;
	assetId = 23456;
}

beforeEach(resetAll);
afterEach(resetAll);

const upsertAssetAuthors = (authors) => upsertAssetAuthorsRaw(querier, currUserId, assetId, authors);

test("no authors", async () => {
	let didCall = false;
	querier = () => {
		didCall = true;
	};
	expect(await upsertAssetAuthors([])).toBeUndefined();
	expect(didCall).toBe(false);
});

test("some authors", async () => {
	let binds = null;
	querier = (query, b) => {
		binds = b;
	};
	expect(
		await upsertAssetAuthors([
			{ firstName: "A", lastName: "B" },
			{ firstName: "C", lastName: "D" },
		])
	).toBeUndefined();
	expect(Array.isArray(binds)).toBe(true);
	binds.sort();
	expect(binds).toEqual([12345, 23456]);
});
