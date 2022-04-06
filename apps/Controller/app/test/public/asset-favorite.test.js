const assetFavoriteRaw = require("../../core/public/asset-favorite");
const context = require("../common/Context");

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/**Common function */
async function assetFavorite(data) {
	let err = null;
	try {
		ctx.body = await assetFavoriteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		pdf_isbn13: "9781913063368",
		is_favorite: true,
	};
}

test(`Error when not login`, async () => {
	const params = getGoodParams();
	ctx.sessionData = null;
	expect(await assetFavorite(params)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when pdf_isbn13 is not valid`, async () => {
	const params = getGoodParams();
	params.pdf_isbn13 = 1234567;
	expect(await assetFavorite(params)).toEqual(new Error("400 ::: pdf_isbn13 invalid"));
});

test(`Error when pdf_isbn13 not pass`, async () => {
	const params = getGoodParams();
	delete params.pdf_isbn13;
	expect(await assetFavorite(params)).toEqual(new Error("400 ::: pdf_isbn13 not provided"));
});

test(`Unknown Error`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("INSERT") !== -1) {
			throw new Error("500 ::: An unexpected error has occurred");
		}
	};
	expect(await assetFavorite(params)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test(`Success`, async () => {
	const params = getGoodParams();
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("INSERT INTO") === 0) {
			return { rows: [{ _count_: 1 }], rowCount: 1 };
		}
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await assetFavorite(params)).toEqual(null);
	expect(ctx.body).toEqual({ success: true });
});
