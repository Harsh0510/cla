let mockVerifyCalls;
let mockDecodeCalls;
let querier;
let mockDecode;

jest.mock("jsonwebtoken", () => {
	return {
		verify(token, key) {
			mockVerifyCalls.push([token, key]);
			return mockDecode(token);
		},
		decode(token) {
			mockDecodeCalls.push(token);
			return mockDecode(token);
		},
	};
});

const resetAll = () => {
	mockDecode = (token) => JSON.parse(token);
	jest.resetModules();
	querier = () => {
		return {
			rowCount: 1,
			rows: [
				{
					id: 12345,
				},
			],
		};
	};
	mockVerifyCalls = [];
	mockDecodeCalls = [];
};

beforeEach(resetAll);

test("success - with key and school", async () => {
	process.env.OAUTH_HWB_ID_TOKEN_SYMMETRIC_KEY = "xxxyyy123";
	const fetchUserDetails = require("../../../../../core/auth/oauth/hwb/redirect/fetchUserDetails");
	const result = await fetchUserDetails(
		querier,
		`
			{
				"oid": "XXX",
				"given_name": "Joan",
				"family_name": "Rivers",
				"upn": "xxx@yyy.zzz",
				"physicalDeliveryOfficeName": 998877
			}
		`
	);
	expect(result).toEqual({
		identifier: "XXX",
		title: "Ms",
		first_name: "Joan",
		last_name: "Rivers",
		email: "xxx@yyy.zzz",
		school_id: 12345,
	});
	expect(mockVerifyCalls.length).toBe(1);
	expect(mockVerifyCalls[0][1]).toBe("xxxyyy123");
	expect(mockDecodeCalls).toEqual([]);
});

test("success - with key but NO school", async () => {
	process.env.OAUTH_HWB_ID_TOKEN_SYMMETRIC_KEY = "xxxyyy123";
	const fetchUserDetails = require("../../../../../core/auth/oauth/hwb/redirect/fetchUserDetails");
	const result = await fetchUserDetails(
		querier,
		`
			{
				"oid": "XXX",
				"given_name": "Joan",
				"family_name": "Rivers",
				"upn": "xxx@yyy.zzz"
			}
		`
	);
	expect(result).toEqual({
		identifier: "XXX",
		title: "Ms",
		first_name: "Joan",
		last_name: "Rivers",
		email: "xxx@yyy.zzz",
		school_id: null,
	});
	expect(mockVerifyCalls.length).toBe(1);
	expect(mockVerifyCalls[0][1]).toBe("xxxyyy123");
	expect(mockDecodeCalls).toEqual([]);
});

test("success - no key but with school", async () => {
	process.env.OAUTH_HWB_ID_TOKEN_SYMMETRIC_KEY = "";
	const fetchUserDetails = require("../../../../../core/auth/oauth/hwb/redirect/fetchUserDetails");
	const token = `
		{
			"oid": "XXX",
			"given_name": "Joan",
			"family_name": "Rivers",
			"upn": "xxx@yyy.zzz",
			"physicalDeliveryOfficeName": 998877
		}
	`;
	const result = await fetchUserDetails(querier, token);
	expect(result).toEqual({
		identifier: "XXX",
		title: "Ms",
		first_name: "Joan",
		last_name: "Rivers",
		email: "xxx@yyy.zzz",
		school_id: 12345,
	});
	expect(mockDecodeCalls).toEqual([token]);
	expect(mockVerifyCalls).toEqual([]);
});

test("error - parsing", async () => {
	process.env.OAUTH_HWB_ID_TOKEN_SYMMETRIC_KEY = "";
	mockDecode = () => null;
	const fetchUserDetails = require("../../../../../core/auth/oauth/hwb/redirect/fetchUserDetails");
	const token = ``;
	const result = await fetchUserDetails(querier, token);
	expect(result).toEqual(null);
	expect(mockDecodeCalls).toEqual([token]);
	expect(mockVerifyCalls).toEqual([]);
});

test("error - no school", async () => {
	process.env.OAUTH_HWB_ID_TOKEN_SYMMETRIC_KEY = "xxxyyy123";
	querier = () => {
		return {
			rowCount: 0,
			rows: [],
		};
	};
	const fetchUserDetails = require("../../../../../core/auth/oauth/hwb/redirect/fetchUserDetails");
	const result = await fetchUserDetails(
		querier,
		`
			{
				"oid": "XXX",
				"given_name": "Joan",
				"family_name": "Rivers",
				"upn": "xxx@yyy.zzz",
				"physicalDeliveryOfficeName": 998877
			}
		`
	);
	expect(result).toEqual(null);
	expect(mockVerifyCalls.length).toBe(1);
	expect(mockVerifyCalls[0][1]).toBe("xxxyyy123");
	expect(mockDecodeCalls).toEqual([]);
});
