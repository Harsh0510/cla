const extractStatusUpdateRaw = require("../../core/public/extract-status-update");

let ctx;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
}

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("UPDATE extract SET status") !== -1) {
		return { rowCount: 1 };
	}
	throw new Error("should not be here");
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
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
			return await getGoodAmmDbQuery(a, b);
		},
		async getClientIp() {
			return "127.0.0.1";
		},
		responseStatus: 200,
	};
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractStatusUpdate(data) {
	let err = null;
	try {
		ctx.body = await extractStatusUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		oid: "4c3c642ea43faead56aa171478c5ae37f17a",
	};
}

test(`Error when user not logged in`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractStatusUpdate(params, ctx)).toEqual(new Error("401 ::: not logged in"));
});

test(`Error when oid is empty`, async () => {
	ctx.sessionData = { school_id: 1, user_role: "school-admin" };
	let params = getParams();
	delete params.oid;
	expect(await extractStatusUpdate(params, ctx)).toEqual(new Error("400 ::: oid not provided"));
});

test(`Success when extract status update`, async () => {
	const params = getParams();
	expect(await extractStatusUpdate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const params = getParams();
	ctx.appDbQuery = async (query, values) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf("UPDATE extract SET status") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return { rowCount: 1 };
		}
		throw new Error("should not be here");
	};
	expect(await extractStatusUpdate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
