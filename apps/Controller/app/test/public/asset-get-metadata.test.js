const assetGetMetadataRaw = require("../../core/public/asset-get-metadata.js");
const Context = require("../common/Context");

let ctx;

function getValidParams() {
	return {
		isbn13: "9781910504734",
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT`) >= 0) {
			return {
				rows: [
					{
						id: 1,
						publisher: "Publisher",
						imprint: "imprint",
					},
				],
				rowCount: 1,
			};
		}
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function assetGetMetadata(data) {
	let err = null;
	try {
		ctx.body = await assetGetMetadataRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when invalid ISBN13 provided`, async () => {
	const params = 123344555;
	expect(await assetGetMetadata(params)).toEqual(new Error("400 ::: ISBN not provided"));
});

test(`Success: get result data When valid ISBN13 provided`, async () => {
	const params = getValidParams();
	expect(await assetGetMetadata(params)).toEqual(null);
	expect(ctx.body).toEqual({ data: { id: 1, imprint: "imprint", publisher: "Publisher" } });
});

test(`Success: Get result data as null when valid ISBN13 provided`, async () => {
	const params = getValidParams();
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT`) >= 0) {
			return {
				rows: [],
				rowCount: 0,
			};
		}
	};
	expect(await assetGetMetadata(params)).toEqual(null);
	expect(ctx.body).toEqual({ data: null });
});
