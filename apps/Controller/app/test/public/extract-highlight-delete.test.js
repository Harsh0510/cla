const extractHighlightDeleteRaw = require("../../core/public/extract-highlight-delete");

let ctx;
let isFirstHighlightNameUpdated = false;
let mockDeleteFromResult,
	mockFromExtractHighlight = [];

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
}

async function getDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("DELETE FROM") !== -1) {
		return {
			rows: [{ extract_id: 552 }],
			rowCount: mockDeleteFromResult,
		};
	}
	if (query.indexOf("FROM extract_highlight") !== -1) {
		isFirstHighlightNameUpdated = true;
		return {
			rows: mockFromExtractHighlight,
		};
	}
	if (query.indexOf("UPDATE extract_page_join") !== -1) {
		return;
	}
	throw new Error("should not be here");
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockFromExtractHighlight = [{ oid: "7a5289732c864505ef154fcbcbf92c99055b" }];
	mockDeleteFromResult = 1;
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

async function extractHighlightDelete(data) {
	let err = null;
	try {
		ctx.body = await extractHighlightDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		oid: "fac1813fea6267d09149406da6abea1de1ae",
	};
}

test(`Error when requester is not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractHighlightDelete(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Return the deleted true if a extract highlight is successfully deleted`, async () => {
	const params = getGoodParams();
	expect(await extractHighlightDelete(params)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Return the deleted false if a extract highlight is not successfully deleted`, async () => {
	const params = getGoodParams();
	mockDeleteFromResult = [{ rowCount: 0 }];
	expect(await extractHighlightDelete(params)).toBe(null);
	expect(ctx.body).toEqual({ result: false });
});

test(`When user is not associated with a school and trying to delete highlight`, async () => {
	const params = getGoodParams();
	ctx.getSessionData = async (_) => {
		const s = getGoodSessionData();
		delete s.school_id;
		return s;
	};
	expect(await extractHighlightDelete(params)).toEqual(new Error("401 ::: You must be associated with a school to Delete an Highlight"));
});

test(`When all highlights are removed for an extract)`, async () => {
	const params = getGoodParams();
	mockFromExtractHighlight = [];
	expect(await extractHighlightDelete(params)).toBe(null);
	expect(isFirstHighlightNameUpdated).toEqual(true);
});
