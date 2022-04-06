jest.mock("../../../../../core/auth/oauth/hwb/common/env.js", () => {
	return {
		tokenEndpoint: "http://google.com",
		clientId: "aaa",
		scope: "bbb",
		redirectUri: "http://redirect.com",
		clientSecret: "ccc",
	};
});

let mockResult;
let mockAxiosCalls;

jest.mock("axios", () => {
	return {
		post(...args) {
			mockAxiosCalls.push([...args]);
			return mockResult;
		},
	};
});

const fetchAzureIdToken = require("../../../../../core/auth/oauth/hwb/redirect/fetchAzureIdToken");

const resetAll = () => {
	mockResult = null;
	mockAxiosCalls = [];
};

beforeEach(resetAll);

test("success", async () => {
	mockResult = {
		data: {
			id_token: "FOO",
		},
	};
	const result = await fetchAzureIdToken("abc", "def");
	expect(result).toBe("FOO");
	expect(mockAxiosCalls).toEqual([
		[
			"http://google.com",
			new URLSearchParams({
				client_id: "aaa",
				grant_type: "authorization_code",
				scope: "bbb",
				code: "def",
				redirect_uri: "http://redirect.com",
				client_secret: "ccc",
				code_verifier: "abc",
			}),
		],
	]);
});

test("error", async () => {
	mockResult = null;
	const result = await fetchAzureIdToken("abc", "def");
	expect(result).toBe(null);
	expect(mockAxiosCalls).toEqual([
		[
			"http://google.com",
			new URLSearchParams({
				client_id: "aaa",
				grant_type: "authorization_code",
				scope: "bbb",
				code: "def",
				redirect_uri: "http://redirect.com",
				client_secret: "ccc",
				code_verifier: "abc",
			}),
		],
	]);
});
