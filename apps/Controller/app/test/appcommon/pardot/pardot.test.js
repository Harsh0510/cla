process.env.CLA_PARDOT_API_SALESFORCE_USERNAME = "random@email.com";
process.env.CLA_PARDOT_API_CLIENT_ID = "password";
process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
process.env.IS_AZURE = true;
process.env.CLA_PARDOT_API_IS_SANDBOX_MODE = true;
process.env.CLA_PARDOT_API_BUSINESS_UNIT_ID = "business id";

const pardot = require("../../../common/pardot/pardot");
const Context = require("../../common/Context");

let ctx, mockThrowExceptionUpdate, mockThrowExceptionCreate;
let mockThrowException = false;
let mockThrowExceptionDirect = false;
let mockThrowExceptionCreateFlag = false;

/**
 * mock of axios
 */
jest.mock("axios", () => {
	return function (params) {
		if (params.url) {
			let trimUrl = params.url.trim().replace(/\s+/g, " ");
			if (trimUrl.indexOf("https://test.salesforce.com/services/oauth2/token") !== -1) {
				return mockAuthenticateResult;
			}
			if (trimUrl.indexOf("listMembership/version/4/do/create/list_id/63/prospect_id/25") != -1) {
				if (mockThrowExceptionCreateFlag) {
					throw mockThrowExceptionCreate;
				} else {
					return mockApiResult;
				}
			}
			if (trimUrl.indexOf("listMembership/version/4/do/delete/list_id/63/prospect_id/25") != -1) {
				return mockApiResult;
			}
			if (trimUrl.indexOf("listMembership/version/4/do/update/list_id/63/prospect_id/25") != -1) {
				if (mockThrowException) {
					return {
						list_membership: true,
						data: {
							"@attributes": {
								stat: "pass",
							},
							prospect: [{ updated_at: "2020:05:23" }],
						},
					};
				} else if (mockThrowExceptionDirect) {
					throw mockThrowExceptionUpdate;
				} else {
					return mockUpdateMembershipResult;
				}
			}
			if (trimUrl.indexOf("https://pi.demo.pardot.com/api") !== -1) {
				return mockApiResult;
			}
		}
	};
});

jest.mock("jsonwebtoken", () => {
	return {
		sign() {
			return "abc".repeat(32);
		},
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	mockThrowException = false;
	mockThrowExceptionDirect = false;
	mockThrowExceptionCreateFlag = false;
	mockAuthenticateResult = {
		status: 200,
		data: {
			access_token: "user_access_token",
		},
	};
	mockThrowExceptionUpdate = {
		result: {
			data: {
				err: "Unknown Error",
			},
		},
	};
	mockThrowExceptionCreate = {
		result: {
			data: {
				err: ["already a member of"],
			},
		},
	};
	mockApiResult = {
		status: 200,
		data: {
			"@attributes": {
				stat: "pass",
			},
			prospect: [{ updated_at: "2020:05:23" }],
		},
	};
	mockUpdateMembershipResult = {
		data: {
			"@attributes": {
				stat: "pass",
			},
			prospect: [{ updated_at: "2020:05:23" }],
			list_membership: {
				prospect_id: 25,
			},
		},
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/** Test _apiKey initializarion */
test(`Test initialization of _accessToken`, async () => {
	expect(pardot._accessToken).toBe("");
});

/** Test _authenticate method */
test(`Throws an error if got any`, async () => {
	mockAuthenticateResult = {
		status: 300,
		statusText: "Unknown Error",
	};
	let err = null;
	try {
		await pardot._authenticate();
	} catch (e) {
		err = e;
	}
	expect(err).toEqual(new Error("Unknown Error"));
});

test(`Throws an error if could not fetch access token`, async () => {
	mockAuthenticateResult.data = "NOT EVEN XML!!!";
	let err = null;
	try {
		await pardot._authenticate();
	} catch (e) {
		err = e;
	}
	expect(err).toEqual(new Error("could not fetch access token"));
});

test(`Returns Access Token successfully`, async () => {
	await pardot._authenticate();
	expect(pardot._accessToken).toEqual("user_access_token");
});

/** Test _api method */
test(`Returns result successfully`, async () => {
	const res = await pardot._api(true, "/mock_api", { password: "123" });
	expect(res).toEqual({
		"@attributes": {
			stat: "pass",
		},
		prospect: [{ updated_at: "2020:05:23" }],
	});
});

test(`Throws an error if got any`, async () => {
	mockApiResult.status = 300;
	let err = null;
	try {
		await pardot._api(true, "/mock_api", { password: "123" });
	} catch (e) {
		err = e;
	}
	expect(err).toEqual(new Error());
});

test(`Throws an error when @attributes status is fail`, async () => {
	mockApiResult = {
		status: 200,
		data: {
			"@attributes": {
				stat: "fail",
			},
			err: "Invalid API key or user key",
		},
	};
	let err = null;
	try {
		await pardot._api(false, "/mock_api", { password: "123" });
	} catch (e) {
		err = e;
	}
	expect(err).toEqual(new Error());
	expect(pardot._accessToken).toEqual("user_access_token");
});

/** Test post method */
test(`Returns result successfully`, async () => {
	const res = await pardot.post("/mock_api", { password: "123" });
	expect(res).toEqual({
		"@attributes": {
			stat: "pass",
		},
		prospect: [{ updated_at: "2020:05:23" }],
	});
});

/** Test get method */
test(`Returns result successfully`, async () => {
	const res = await pardot.get("/mock_api", { password: "123" });
	expect(res).toEqual({
		"@attributes": {
			stat: "pass",
		},
		prospect: [{ updated_at: "2020:05:23" }],
	});
});

/** Test getProspect method */
test(`Returns the most recently updated prospect in case of multiple prospects`, async () => {
	const res = await pardot.getProspect("mock@gmail.com");
	expect(res).toEqual({ updated_at: "2020:05:23" });
});

test(`Returns single prospect successfully`, async () => {
	mockApiResult.data.prospect = {
		updated_at: "2020-01-02",
	};
	const res = await pardot.getProspect("mock@gmail.com");
	expect(res).toEqual({ updated_at: "2020-01-02" });
});

test(`Returns null when 0 prospects`, async () => {
	mockApiResult.data.prospect = [];
	const res = await pardot.getProspect("mock@gmail.com");
	expect(res).toBe(null);
});

test(`Returns null when no prospects`, async () => {
	mockApiResult.data.prospect = null;
	const res = await pardot.getProspect("mock@gmail.com");
	expect(res).toBe(null);
});

/** Test addProspect method */
test(`Add prospect successfully`, async () => {
	const details = {
		first_name: "first-name",
		last_name: "last-name",
		school_identifier: "primary",
		school_name: "nobel primary school",
		job_title: "teacher",
		email: "school_teacher@cla.com",
	};
	const res = await pardot.addProspect(details);
	expect(res).toEqual([{ updated_at: "2020:05:23" }]);
});

/** Test insertListMembership method */
test(`Insert list membership successfully`, async () => {
	const res = await pardot.insertListMembership(25, 63, true);
	expect(res).toEqual(undefined);

	const result = await pardot.insertListMembership(25, 63, false);
	expect(result).toEqual(undefined);
});

/** Test insertIgnoreListMembership method */
test(`Insert ignore list membership successfully`, async () => {
	const res = await pardot.insertIgnoreListMembership(25, 63, true);
	expect(res).toEqual(true);
});

test(`Catch exception while Inserting ignore list membership`, async () => {
	mockThrowExceptionCreateFlag = true;
	expect(await pardot.insertIgnoreListMembership(25, 63, true)).toBe(false);
});

/** Test deleteListMembership method */
test(`Delete list membership successfully`, async () => {
	const res = await pardot.deleteListMembership(25, 63);
	expect(res).toEqual(undefined);
});

/** Test updateListMembership method */
test(`Upadte list membership successfully`, async () => {
	const res = await pardot.updateListMembership(25, 63, "optedIn");
	expect(res).toEqual(undefined);
});

test(`Throw an error if got error in updating`, async () => {
	let err = null;
	try {
		await pardot.updateListMembership(25, 63);
	} catch (e) {
		err = e;
	}
	expect(err).toEqual(new Error("error updating list membership [2]"));
});

test(`Throw an error if could not update list membership`, async () => {
	mockUpdateMembershipResult.data.list_membership = null;
	let err = null;
	try {
		await pardot.updateListMembership(25, 63, "optedIn");
	} catch (e) {
		err = e;
	}
	expect(err).toEqual(new Error("could not update list membership [1]"));
});

/** Test upsertListMembership method */
test(`Update list membership successfully`, async () => {
	const res = await pardot.upsertListMembership(25, 63, "optedIn");
	expect(res).toEqual(undefined);
});

test(`Test when list membership already exists`, async () => {
	mockThrowException = true;
	let err = null;
	try {
		await pardot.upsertListMembership(25, 63, "optedIn");
	} catch (e) {
		err = e;
	}
	expect(err).toEqual(new Error("could not update list membership [1]"));
});

test(`Test Exceptions when list membership already exists`, async () => {
	mockThrowExceptionDirect = true;
	let err = null;
	try {
		await pardot.upsertListMembership(25, 63, "optedIn");
	} catch (e) {
		err = e;
	}
	expect(err).toEqual({
		result: {
			data: {
				err: "Unknown Error",
			},
		},
	});

	mockThrowExceptionUpdate.result = {
		data: {
			err: "Invalid ID",
		},
	};
	try {
		await pardot.upsertListMembership(25, 63, "optedIn");
	} catch (e) {
		err = e;
	}
	expect(err).toEqual({
		result: {
			data: {
				err: "Invalid ID",
			},
		},
	});
});
