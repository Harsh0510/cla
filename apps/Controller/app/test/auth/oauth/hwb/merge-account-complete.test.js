let mockInsertSessionDataCallArgs;

jest.mock("../../../../core/auth/common/insertSessionData.js", () => {
	return (...args) => {
		mockInsertSessionDataCallArgs.push([...args]);
	};
});

const func = require("../../../../core/auth/oauth/hwb/merge-account-complete");

let ctx;
let sessionData;
let doQuery;
let queryCalls = [];
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

const resetAll = () => {
	mockInsertSessionDataCallArgs = [];
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

describe("Check status only", () => {
	test("All is fine", async () => {
		doQuery = (query) => {
			if (query.indexOf("AS already_registered") >= 0) {
				return [
					{
						token_expired: false,
						already_registered: false,
					},
				];
			}
			return [];
		};
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
			check_status_only: true,
		});
		expect(err).toBeUndefined();
		expect(result).toEqual({});
	});

	test("No user", async () => {
		doQuery = (query) => {
			if (query.indexOf("AS already_registered") >= 0) {
				return [];
			}
			return [];
		};
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
			check_status_only: true,
		});
		expect(err).toEqual(new Error("400: Token NonExistent"));
	});

	test("Token expired", async () => {
		doQuery = (query) => {
			if (query.indexOf("AS already_registered") >= 0) {
				return [
					{
						token_expired: true,
						already_registered: false,
					},
				];
			}
			return [];
		};
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
			check_status_only: true,
		});
		expect(err).toEqual(new Error("400: Token Expired"));
	});

	test("Already registered", async () => {
		doQuery = (query) => {
			if (query.indexOf("AS already_registered") >= 0) {
				return [
					{
						token_expired: false,
						already_registered: true,
					},
				];
			}
			return [];
		};
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
			check_status_only: true,
		});
		expect(err).toEqual(new Error("400: Already Registered"));
	});
});

describe("Complete merge", () => {
	test("T&C not accepted", async () => {
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
		});
		expect(err).toEqual(new Error("400: Please accept the terms and conditions"));
	});
	test("srcUser not found", async () => {
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
			terms_accepted: true,
		});
		expect(err).toEqual(new Error("400: Token NonExistent"));
	});
	test("destUser not found", async () => {
		doQuery = (query, binds) => {
			if (query.indexOf("DELETE FROM cla_user") === 0) {
				return [
					{
						id: 1234,
						hwb_email: "a@b.c",
						hwb_user_identifier: "abc",
						hwb_chosen_merge_user_id: 5678,
					},
				];
			}
			return [];
		};
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
			terms_accepted: true,
		});
		expect(err).toEqual(new Error("400: User wasn't found"));
	});
	test("Success, not logged in as srcUser", async () => {
		doQuery = (query, binds) => {
			if (query.indexOf("DELETE FROM cla_user") === 0) {
				return [
					{
						id: 1234,
						hwb_email: "a@b.c",
						hwb_user_identifier: "abc",
						hwb_chosen_merge_user_id: 5678,
					},
				];
			} else if (query.indexOf("UPDATE cla_user SET") === 0) {
				return [
					{
						id: 5678,
					},
				];
			}
			return [];
		};
		sessionData = null;
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
			terms_accepted: true,
		});
		expect(result).toEqual({
			success: true,
			needsReauth: false,
		});
		expect(err).toBeUndefined();
	});
	test("Success, logged in as srcUser", async () => {
		doQuery = (query, binds) => {
			if (query.indexOf("DELETE FROM cla_user") === 0) {
				return [
					{
						id: 1234,
						hwb_email: "a@b.c",
						hwb_user_identifier: "abc",
						hwb_chosen_merge_user_id: 5678,
					},
				];
			} else if (query.indexOf("UPDATE cla_user SET") === 0) {
				return [
					{
						id: 5678,
					},
				];
			} else if (query.indexOf("SELECT ") === 0) {
				return [
					{
						id: 5678,
						role: "teacher",
						email: "x@y.z",
						school_id: 999,
						academic_year_end_month: 7,
						academic_year_end_day: 31,
						is_first_time_flyout_enabled: true,
					},
				];
			}
			return [];
		};
		sessionData = {
			user_id: 1234,
		};
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
			terms_accepted: true,
		});
		expect(err).toBeUndefined();
		expect(result).toEqual({
			success: true,
			needsReauth: true,
		});
	});
});

describe("Ensure fields updated", () => {
	test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
		doQuery = (query, binds) => {
			if (query.indexOf("DELETE FROM cla_user") === 0) {
				return [
					{
						id: 1234,
						hwb_email: "a@b.c",
						hwb_user_identifier: "abc",
						hwb_chosen_merge_user_id: 5678,
					},
				];
			} else if (query.indexOf("UPDATE cla_user SET") === 0) {
				mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
				mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
				return [
					{
						id: 5678,
					},
				];
			} else if (query.indexOf("SELECT ") === 0) {
				return [
					{
						id: 5678,
						role: "teacher",
						email: "x@y.z",
						school_id: 999,
						academic_year_end_month: 7,
						academic_year_end_day: 31,
						is_first_time_flyout_enabled: true,
					},
				];
			}
			return [];
		};
		sessionData = {
			user_id: 1234,
		};
		const [result, err] = await exec({
			activation_token: "123456789012345678901234567890123456",
			terms_accepted: true,
		});
		expect(err).toBeUndefined();
		expect(result).toEqual({
			success: true,
			needsReauth: true,
		});
		expect(mockIsIncludeDateEdited).toBe(true);
		expect(mockIsIncludeModifyUserId).toBe(true);
	});
});
