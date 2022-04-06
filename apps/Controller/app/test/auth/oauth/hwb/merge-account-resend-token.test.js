let mockSendMergeVerifyEmailCallArgs;

jest.mock("../../../../core/auth/oauth/hwb/common/sendMergeVerifyEmail.js", () => {
	return (...args) => {
		mockSendMergeVerifyEmailCallArgs.push([...args]);
	};
});

const func = require("../../../../core/auth/oauth/hwb/merge-account-resend-token");

let ctx;
let sessionData;
let doQuery;
let queryCalls = [];
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

const resetAll = () => {
	mockSendMergeVerifyEmailCallArgs = [];
	sessionData = null;
	doQuery = () => [];
	queryCalls = [];
	const queryWrap = (query, binds) => {
		query = query.replace(/[\s\t\r\n]+/g, " ").trim();
		const rows = doQuery(query, binds);
		queryCalls.push([query, binds]);
		return {
			rows: rows,
			rowCount: rows.length,
		};
	};
	ctx = {
		getAppDbPool() {
			return {
				connect() {
					return {
						query(...args) {
							return queryWrap(...args);
						},
						release() {},
					};
				},
			};
		},
		appDbQuery(...args) {
			return queryWrap(...args);
		},
		getSessionData() {
			return sessionData;
		},
		throw(httpCode, msg) {
			throw new Error(httpCode + ": " + msg);
		},
		assert(expr, httpCode, msg) {
			if (!expr) {
				this.throw(httpCode, msg);
			}
		},
	};
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
};

beforeEach(resetAll);
afterEach(resetAll);

const exec = async (params) => {
	let ret;
	const app = {
		route(_, cb) {
			ret = cb;
		},
	};
	func(app);

	let err;
	let result;
	try {
		result = await ret(params, ctx);
	} catch (e) {
		err = e;
	}
	return [result, err];
};

test("Invalid activation token", async () => {
	sessionData = null;
	const [result, err] = await exec({
		activation_token: "XXX",
	});
	expect(result).toBeUndefined();
	expect(err.message).toBe("400: Token not valid");
});

test("Success with activation token", async () => {
	sessionData = null;
	doQuery = (query) => {
		if (query.indexOf("UPDATE") === 0) {
			return [
				{
					hwb_chosen_merge_user_id: 12345,
					hwb_merge_token: "ABC123",
				},
			];
		} else if (query.indexOf("SELECT") === 0) {
			return [
				{
					email: "foo@bar.com",
				},
			];
		}
		return [];
	};
	const [result, err] = await exec({
		activation_token: "123456789012345678901234567890123456",
	});
	expect(result).toEqual({});
	expect(err).toBeUndefined();
	expect(mockSendMergeVerifyEmailCallArgs).toEqual([["foo@bar.com", "ABC123"]]);
});

test("Success when logged in without activation token", async () => {
	sessionData = {
		user_id: 123456,
	};
	doQuery = (query) => {
		if (query.indexOf("UPDATE") === 0) {
			return [
				{
					hwb_chosen_merge_user_id: 12345,
					hwb_merge_token: "ABC123",
				},
			];
		} else if (query.indexOf("SELECT") === 0) {
			return [
				{
					email: "foo@bar.com",
				},
			];
		}
		return [];
	};
	const [result, err] = await exec({});
	expect(result).toEqual({});
	expect(err).toBeUndefined();
	expect(mockSendMergeVerifyEmailCallArgs).toEqual([["foo@bar.com", "ABC123"]]);
});

test("Could not update user", async () => {
	sessionData = null;
	let didRollback = false;
	doQuery = (query) => {
		if (query.indexOf("UPDATE") === 0) {
			return [];
		} else if (query.indexOf("SELECT") === 0) {
			return [
				{
					email: "foo@bar.com",
				},
			];
		} else if (query === "ROLLBACK") {
			didRollback = true;
		}
		return [];
	};
	const [result, err] = await exec({
		activation_token: "123456789012345678901234567890123456",
	});
	expect(result).toEqual({});
	expect(err).toBeUndefined();
	expect(didRollback).toBe(true);
	expect(mockSendMergeVerifyEmailCallArgs).toEqual([]);
});

test("Could not fetch user after update", async () => {
	sessionData = null;
	let didRollback = false;
	doQuery = (query) => {
		if (query.indexOf("UPDATE") === 0) {
			return [
				{
					hwb_chosen_merge_user_id: 12345,
					hwb_merge_token: "ABC123",
				},
			];
		} else if (query === "ROLLBACK") {
			didRollback = true;
		}
		return [];
	};
	const [result, err] = await exec({
		activation_token: "123456789012345678901234567890123456",
	});
	expect(result).toEqual({});
	expect(err).toBeUndefined();
	expect(didRollback).toBe(true);
	expect(mockSendMergeVerifyEmailCallArgs).toEqual([]);
});

test("Rollback after SQL error", async () => {
	sessionData = null;
	let didRollback = false;
	doQuery = (query) => {
		if (query.indexOf("UPDATE") === 0) {
			throw new Error("SQL error!");
		} else if (query === "ROLLBACK") {
			didRollback = true;
		}
		return [];
	};
	const [result, err] = await exec({
		activation_token: "123456789012345678901234567890123456",
	});
	expect(result).toBeUndefined();
	expect(err).toEqual(new Error("SQL error!"));
	expect(didRollback).toBe(true);
	expect(mockSendMergeVerifyEmailCallArgs).toEqual([]);
});

test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
	sessionData = {
		user_id: 123456,
	};
	doQuery = (query) => {
		if (query.indexOf("UPDATE") === 0) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return [
				{
					hwb_chosen_merge_user_id: 12345,
					hwb_merge_token: "ABC123",
				},
			];
		} else if (query.indexOf("SELECT") === 0) {
			return [
				{
					email: "foo@bar.com",
				},
			];
		}
		return [];
	};
	const [result, err] = await exec({});
	expect(result).toEqual({});
	expect(err).toBeUndefined();
	expect(mockSendMergeVerifyEmailCallArgs).toEqual([["foo@bar.com", "ABC123"]]);
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
