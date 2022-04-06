jest.mock("../../../../core/auth/oauth/hwb/common/env.js", () => {
	return {
		clientId: "aaa",
		redirectUri: "http://google.com",
		scope: "bbb",
		authorizeEndpoint: "http://tvf.co.uk/auth",
		stateSecret: "ZZZZ",
	};
});

const func = require("../../../../core/auth/oauth/hwb/login");

let ctx;
let appDbQuery;
let redirect;
let headers;

const resetAll = () => {
	appDbQuery = null;
	redirect = null;
	headers = {};
	ctx = {
		appDbQuery(query) {
			return appDbQuery(query);
		},
		_koaCtx: {
			redirect(str) {
				redirect = str;
			},
			set(key, value) {
				headers[key] = value;
			},
		},
	};
};

beforeEach(resetAll);
afterEach(resetAll);

const exec = (params) => {
	let ret;
	const app = {
		route(endpoint, cb) {
			ret = cb;
		},
	};
	func(app);
	return ret(params, ctx);
};

test("Executes properly", async () => {
	appDbQuery = () => ({
		rows: [
			{
				oid: "XXX",
				challenge: "YYY",
			},
		],
	});
	const result = await exec({});
	expect(result).toEqual({});
	const u = new URL(redirect);
	const us = u.searchParams;
	expect(us.get("client_id")).toBe("aaa");
	expect(us.get("response_type")).toBe("code");
	expect(us.get("redirect_uri")).toBe("http://google.com");
	expect(us.get("scope")).toBe("bbb");
	expect(us.get("response_mode")).toBe("query");
	expect(us.get("state").indexOf("XXX_")).toBe(0);
	expect(us.get("code_challenge_method")).toBe("S256");
	expect(us.has("code_challenge")).toBe(true);
});
