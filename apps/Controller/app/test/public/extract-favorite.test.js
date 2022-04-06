const extractFavoriteRaw = require("../../core/public/extract-favorite");
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
async function extractFavorite(data) {
	let err = null;
	try {
		ctx.body = await extractFavoriteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		oid: "c38da68d77e2ab50f2055f7fb029cc10b8c0",
		is_favorite: true,
	};
}

test(`Error when not login`, async () => {
	const params = getGoodParams();
	ctx.sessionData = null;
	expect(await extractFavorite(params)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when oid is not valid`, async () => {
	const params = getGoodParams();
	params.oid = 1234567;
	expect(await extractFavorite(params)).toEqual(new Error("400 ::: oid invalid"));
});

test(`Error when oid not pass`, async () => {
	const params = getGoodParams();
	delete params.oid;
	expect(await extractFavorite(params)).toEqual(new Error("400 ::: oid not provided"));
});

test(`Unknown Error`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("INSERT") !== -1) {
			throw new Error("401 ::: Must be associated with a school");
		}
	};
	expect(await extractFavorite(params)).toEqual(new Error("401 ::: Must be associated with a school"));
});

test(`Success`, async () => {
	const params = getGoodParams();
	ctx.sessionData.school_id = 225;
	ctx.appDbQuery = (query, values) => {
		if (query.indexOf("INSERT INTO") === 0) {
			return { rows: [{ _count_: 1 }], rowCount: 1 };
		}
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await extractFavorite(params)).toEqual(null);
	expect(ctx.body).toEqual({ success: true });
});
