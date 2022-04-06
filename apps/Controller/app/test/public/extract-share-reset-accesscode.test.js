const extractShareResetAccesscodeRaw = require("../../core/public/extract-share-reset-accesscode");
const Context = require("../common/Context");

jest.mock("../../core/auth/common/canCopy", () => {
	return {
		ensureCanCopy: async () => {
			return true;
		},
	};
});

let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};
	ctx.getSessionData = async (_) => {
		const s = getGoodSessionData();
		return s;
	};
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
		allowed_extract_ratio: 0.05,
	};
}

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("UPDATE extract_share") !== -1) {
		return {
			rows: [{ id: 1 }],
		};
	}
	throw new Error("should not be here");
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractShareResetAccesscode(data) {
	let err = null;
	try {
		ctx.body = await extractShareResetAccesscodeRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		share_oid: "b".repeat(36),
	};
}

test(`Error when extract_share_oid is not provided`, async () => {
	const params = getGoodParams();
	delete params.share_oid;
	expect(await extractShareResetAccesscode(params)).toEqual(new Error("400 ::: Share oid not provided"));
});

test(`Error when invalid extract_share_oid is provided`, async () => {
	const params = getGoodParams();
	params.share_oid = "1234";
	expect(await extractShareResetAccesscode(params)).toEqual(new Error("400 ::: Share oid not valid"));
});

test(`Error when invalid user role`, async () => {
	ctx.getSessionData = async (_) => {
		const s = getGoodSessionData();
		s.user_role = "cla-admin";
		return null;
	};
	const params = getGoodParams();
	expect(await extractShareResetAccesscode(params)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Successfully reset access_code`, async () => {
	const params = getGoodParams();
	expect(await extractShareResetAccesscode(params)).toEqual(null);
	expect(ctx.body).toEqual({ oid: "b".repeat(36) });
});

test(`Throw unknown error`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("UPDATE extract_share") !== -1) {
			throw Error("400 ::: Unknown error [1]");
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractShareResetAccesscode(params)).toEqual(new Error("400 ::: Unknown error [1]"));
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = async function (query, values) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf("UPDATE extract_share SET") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return {
				rows: [{ id: 1 }],
			};
		}
		throw new Error("should not be here");
	};
	expect(await extractShareResetAccesscode(params)).toEqual(null);
	expect(ctx.body).toEqual({ oid: "b".repeat(36) });
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
