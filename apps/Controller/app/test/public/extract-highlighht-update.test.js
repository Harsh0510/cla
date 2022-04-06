const extractHighlighUpdateRaw = require("../../core/public/extract-highlight-update");

let ctx;
let mockFromExtractResult;

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 24,
		school_id: 153,
	};
}

async function getDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("SELECT extract_highlight.id") !== -1) {
		return {
			rows: mockFromExtractResult,
			rowCount: 1,
		};
	}
	if (query.indexOf("UPDATE extract_highlight") !== -1) {
		return {
			rows: [{ oid: "7a5289732c864505ef154fcbcbf92c99055b" }],
			rowCount: 1,
		};
	}
	throw new Error("should not be here");
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockFromExtractResult = [{ extract_id: 123, user_id: 24 }];
	ctx = {
		assert(expr, status, msg) {
			if (expr) {
				return;
			}
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		throw(status, msg) {
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		async ensureLoggedIn() {
			return true;
		},
		async getSessionData() {
			return getGoodSessionData();
		},
		async appDbQuery(a, b) {
			return await getDbQuery(a, b);
		},
		responseStatus: 200,
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractHighlighUpdate(data) {
	let err = null;
	try {
		ctx.body = await extractHighlighUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		oid: "fac1813fea6267d09149406da6abea1de1ae",
		page: 1,
		width: 34,
		height: 45,
		position_x: 0.5,
		position_y: 9.1,
	};
}

test(`Error when user is not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractHighlighUpdate(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`When user is not associated with a school and trying to update highlight`, async () => {
	const params = getGoodParams();
	ctx.getSessionData = async (_) => {
		const s = getGoodSessionData();
		delete s.school_id;
		return s;
	};
	expect(await extractHighlighUpdate(params)).toEqual(new Error("401 ::: You must be associated with a school to update an Highlight"));
});

test(`Error an invalid oid is supplied`, async () => {
	const params = getGoodParams();
	params.oid = "invalid";
	expect(await extractHighlighUpdate(params)).toEqual(new Error("400 ::: oid not valid"));
});

test(`Success`, async () => {
	const params = getGoodParams();
	expect(await extractHighlighUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: [{ oid: "7a5289732c864505ef154fcbcbf92c99055b" }] });
});

test(`Success`, async () => {
	const params = getGoodParams();
	expect(await extractHighlighUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: [{ oid: "7a5289732c864505ef154fcbcbf92c99055b" }] });
});

test(`Error when width should not be the real type`, async () => {
	const params = getGoodParams();
	params.page = "ab";
	expect(await extractHighlighUpdate(params)).toEqual(new Error("400 ::: Page invalid"));
});

test(`Success when page is not provided`, async () => {
	const params = getGoodParams();
	delete params.page;
	expect(await extractHighlighUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: [{ oid: "7a5289732c864505ef154fcbcbf92c99055b" }] });
});

test(`Error when width should not be the real type`, async () => {
	const params = getGoodParams();
	params.width = "ab";
	expect(await extractHighlighUpdate(params)).toEqual(new Error("400 ::: Width should be the real type"));
});

test(`Success when width is not provided`, async () => {
	const params = getGoodParams();
	delete params.width;
	expect(await extractHighlighUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: [{ oid: "7a5289732c864505ef154fcbcbf92c99055b" }] });
});

test(`Error when height should not be the real type`, async () => {
	const params = getGoodParams();
	params.height = "ac";
	expect(await extractHighlighUpdate(params)).toEqual(new Error("400 ::: Height should be the real type"));
});

test(`Success when height is not provided`, async () => {
	const params = getGoodParams();
	delete params.height;
	expect(await extractHighlighUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: [{ oid: "7a5289732c864505ef154fcbcbf92c99055b" }] });
});

test(`Error when position x should not be the real type`, async () => {
	const params = getGoodParams();
	params.position_x = "ab";
	expect(await extractHighlighUpdate(params)).toEqual(new Error("400 ::: Position x should be the real type"));
});

test(`Success when position_x is not provided`, async () => {
	const params = getGoodParams();
	delete params.position_x;
	expect(await extractHighlighUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: [{ oid: "7a5289732c864505ef154fcbcbf92c99055b" }] });
});

test(`Error when position y should not be the real type`, async () => {
	const params = getGoodParams();
	params.position_y = "xr";
	expect(await extractHighlighUpdate(params)).toEqual(new Error("400 ::: Position y should be the real type"));
});

test(`Success when position_y is not provided`, async () => {
	const params = getGoodParams();
	delete params.position_y;
	expect(await extractHighlighUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: [{ oid: "7a5289732c864505ef154fcbcbf92c99055b" }] });
});

test(`When non extract creater trying to create an highlight`, async () => {
	const params = getGoodParams();
	mockFromExtractResult = [{ extract_id: 305, user_id: 185693 }];
	expect(await extractHighlighUpdate(params)).toEqual(new Error("400 ::: You don't have rights to update the highlight for this extract."));
});

test(`Error when extract is not found`, async () => {
	const params = getGoodParams();
	mockFromExtractResult = [];
	expect(await extractHighlighUpdate(params)).toEqual(new Error("400 ::: Extract not found"));
});
