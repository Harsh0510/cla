let mockPostCalls = [];
let mockGetCalls = [];
let mockPostResult;
let mockGetResult;

jest.mock("axios", () => {
	return {
		post(...args) {
			mockPostCalls.push([...args]);
			return mockPostResult;
		},
		get(...args) {
			mockGetCalls.push([...args]);
			return mockGetResult;
		},
	};
});

const fetchSchools = require("../../../../core/admin/async_task/hwbSchoolSync/fetchSchools");

beforeEach(() => {
	mockPostCalls = [];
	mockGetCalls = [];
	mockPostResult = {
		data: {},
	};
	mockGetResult = {
		data: {},
	};
});

test("executes", async () => {
	mockPostResult = {
		data: {
			access_token: "abc123",
		},
	};
	mockGetResult = {
		data: "THE RESULT!",
	};
	const res = await fetchSchools({
		tokenEndpoint: "http://google.com",
		clientId: "XXX",
		clientSecret: "YYY",
		schoolApiEndpoint: "http://yahoo.com",
		base64Cert: "ZZZ",
	});
	expect(res).toBe("THE RESULT!");
	expect(mockPostCalls.length).toBe(1);
	expect(mockGetCalls.length).toBe(1);
});
