let mockPromoteToRealAccountCalls;

jest.mock("../../../../core/auth/oauth/hwb/common/promoteToRealAccount.js", () => {
	return (...args) => {
		mockPromoteToRealAccountCalls.push([...args]);
	};
});

let mockSendMergeVerifyEmailCalls;

jest.mock("../../../../core/auth/oauth/hwb/common/sendMergeVerifyEmail.js", () => {
	return (...args) => {
		mockSendMergeVerifyEmailCalls.push([...args]);
	};
});

const func = require("../../../../core/auth/oauth/hwb/merge-account-init");

let ctx;
let sessionData;
let doQuery;
let queryCalls = [];
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

const resetAll = () => {
	mockPromoteToRealAccountCalls = [];
	mockSendMergeVerifyEmailCalls = [];
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
		clearSessId() {},
		addSessIdToResponse() {},
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

test("Success - email provided", async () => {
	sessionData = {
		user_id: 1234,
	};
	doQuery = (query, binds) => {
		if (query.indexOf("SELECT ") === 0) {
			return [
				{
					id: 5678,
					email: "foo@bar.com",
				},
			];
		} else if (query.indexOf("UPDATE cla_user SET ") === 0) {
			return [
				{
					hwb_merge_token: "XYZ",
				},
			];
		}
		return [];
	};
	const [result, err] = await exec({
		email: "foo@bar.com",
	});
	expect(err).toBeUndefined();
	expect(result).toEqual({});
	expect(mockSendMergeVerifyEmailCalls).toEqual([["foo@bar.com", "XYZ"]]);
});

test("Success - current user (no email provided)", async () => {
	sessionData = {
		user_id: 1234,
	};
	doQuery = (query, binds) => {
		if (query.indexOf("SELECT ") === 0) {
			return [
				{
					id: 5678,
					email: "foo@bar.com",
				},
			];
		} else if (query.indexOf("UPDATE cla_user SET ") === 0) {
			return [
				{
					hwb_merge_token: "XYZ",
				},
			];
		}
		return [];
	};
	const [result, err] = await exec({});
	expect(err).toBeUndefined();
	expect(result).toEqual({});
});

test("No user found when email is provided", async () => {
	sessionData = {
		user_id: 1234,
	};
	doQuery = (query, binds) => {
		if (query.indexOf("UPDATE cla_user SET ") === 0) {
			return [
				{
					hwb_merge_token: "XYZ",
				},
			];
		}
		return [];
	};
	const [result, err] = await exec({
		email: "foo@bar.com",
	});
	expect(err).toBeUndefined();
	expect(result).toEqual({});
	expect(mockPromoteToRealAccountCalls.length).toBe(1);
	expect(mockPromoteToRealAccountCalls[0][1]).toBe(1234);
});

test("No user found when NO email is provided", async () => {
	sessionData = {
		user_id: 1234,
	};
	doQuery = (query, binds) => {
		if (query.indexOf("UPDATE cla_user SET ") === 0) {
			return [
				{
					hwb_merge_token: "XYZ",
				},
			];
		}
		return [];
	};
	const [result, err] = await exec({});
	expect(err).toBeUndefined();
	expect(result).toEqual({});
	expect(mockPromoteToRealAccountCalls).toEqual([]);
});

test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
	sessionData = {
		user_id: 1234,
	};
	doQuery = (query, binds) => {
		if (query.indexOf("SELECT ") === 0) {
			return [
				{
					id: 5678,
					email: "foo@bar.com",
				},
			];
		} else if (query.indexOf("UPDATE cla_user SET ") === 0) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return [
				{
					hwb_merge_token: "XYZ",
				},
			];
		}
		return [];
	};
	const [result, err] = await exec({
		email: "foo@bar.com",
	});
	expect(err).toBeUndefined();
	expect(result).toEqual({});
	expect(mockSendMergeVerifyEmailCalls).toEqual([["foo@bar.com", "XYZ"]]);
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
