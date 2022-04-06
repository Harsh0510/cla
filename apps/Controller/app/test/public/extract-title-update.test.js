const extractTitleUpdateRaw = require("../../core/public/extract-title-update");
const Context = require("../common/Context");

let ctx;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;
jest.mock("../../core/auth/common/canCopy", () => {
	return {
		ensureCanCopy: async () => {
			return true;
		},
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractTitleUpdate(data) {
	let err = null;
	try {
		ctx.body = await extractTitleUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		extract_oid: "4c3c642ea43faead56aa171478c5ae37f17a",
		title: "Test",
	};
}

test(`Error when user not logged in`, async () => {
	const params = getParams();
	ctx.sessionData.user_role = null;
	expect(await extractTitleUpdate(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when extract title is empty`, async () => {
	let params = getParams();
	params.extract_oid = "test";
	params.title = "";
	ctx.sessionData.user_role = "school-admin";
	expect(await extractTitleUpdate(params, ctx)).toEqual(new Error("400 ::: Title not provided"));
});

test(`Error when extract oid is empty`, async () => {
	let params = getParams();
	params.extract_oid = "";
	params.title = "test";
	ctx.sessionData.user_role = "school-admin";
	expect(await extractTitleUpdate(params, ctx)).toEqual(new Error("400 ::: Extract Oid not provided"));
});

test(`Error when extract not found`, async () => {
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("SELECT") !== -1) {
			return { rows: [] };
		}
		if (query.indexOf("UPDATE") !== -1) {
			return { rows: [], rowCount: 0 };
		}
		throw new Error("should never get here");
	};
	ctx.sessionData.user_role = "school-admin";
	const params = getParams();
	expect(await extractTitleUpdate(params, ctx)).toEqual(new Error("400 ::: Extract not found"));
});

test(`Success when extract found`, async () => {
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("SELECT") !== -1) {
			return { rows: [1] };
		}
		if (query.indexOf("UPDATE") !== -1) {
			return { rows: [true], rowCount: 1 };
		}
		throw new Error("should never get here");
	};
	ctx.sessionData.user_role = "school-admin";
	const params = getParams();
	expect(await extractTitleUpdate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("SELECT") !== -1) {
			return { rows: [1] };
		}
		if (query.indexOf("UPDATE") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return { rows: [true], rowCount: 1 };
		}
		throw new Error("should never get here");
	};
	ctx.sessionData.user_role = "school-admin";
	const params = getParams();
	expect(await extractTitleUpdate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
