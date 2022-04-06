const intentToCopyUpdateRaw = require("../../core/public/intent-to-copy-update");
const context = require("../common/Context");

let ctx;
let mockUpdateIntentToCopyResult = [];
let mockUpdateNotificationResult = [];
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

async function getDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("UPDATE unlock_attempt SET intent_to_copy") !== -1) {
		return mockUpdateIntentToCopyResult;
	} else if (query.indexOf("UPDATE notification ") !== -1) {
		return {
			rows: mockUpdateNotificationResult,
		};
	}
	throw new Error("should not be here");
}

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
		allowed_extract_ratio: 0.05,
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
	mockUpdateIntentToCopyResult = {
		rowCount: 1,
		oid: null,
		rows: [{ id: 13190 }],
	};

	mockUpdateNotificationResult = [
		{
			oid: "7a5289732c864505ef154fcbcbf92c99055b",
		},
	];
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
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function intentToCopyUpdate(data) {
	let err = null;
	try {
		ctx.body = await intentToCopyUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		oid: "7a5289732c864505ef154fcbcbf92c99055b",
		notification_oid: "7a5289732c864505ef154fcbcbf92c99055b",
		intent: true,
	};
}

test(`Error when not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await intentToCopyUpdate(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Error when invalid oid is provided`, async () => {
	const params = getGoodParams();
	params.oid = 123;
	expect(await intentToCopyUpdate(params)).toEqual(new Error("400 ::: OID invalid"));
});

test(`Error when invalid notification_oid is provided`, async () => {
	const params = getGoodParams();
	params.notification_oid = 123;
	expect(await intentToCopyUpdate(params)).toEqual(new Error("400 ::: Notification OID invalid"));
});

test(`Return the result true if  is successfully edited`, async () => {
	const params = getGoodParams();
	expect(await intentToCopyUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({
		updated: true,
	});
});

test(`Return the result true if  notification link is not updated`, async () => {
	const params = getGoodParams();
	delete params.notification_oid;
	expect(await intentToCopyUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({
		updated: true,
	});
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf("UPDATE unlock_attempt SET intent_to_copy") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return mockUpdateIntentToCopyResult;
		} else if (query.indexOf("UPDATE notification ") !== -1) {
			return {
				rows: mockUpdateNotificationResult,
			};
		}
		throw new Error("should not be here");
	};
	expect(await intentToCopyUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({
		updated: true,
	});
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
