let mockPromoteToRealAccountCallArgs;

jest.mock("../../../../core/auth/oauth/hwb/common/promoteToRealAccount.js", () => {
	return (...args) => {
		mockPromoteToRealAccountCallArgs.push([...args]);
	};
});

const func = require("../../../../core/auth/oauth/hwb/promote-account");

let ctx;
let sessionData;

const resetAll = () => {
	mockPromoteToRealAccountCallArgs = [];
	sessionData = null;
	ctx = {
		appDbQuery() {},
		getSessionData() {
			return sessionData;
		},
		assert(expr, httpCode, msg) {
			if (!expr) {
				throw new Error(httpCode + ": " + msg);
			}
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
		route(_, cb) {
			ret = cb;
		},
	};
	func(app);
	return ret(params, ctx);
};

test("Errors when not logged in", async () => {
	sessionData = null;
	let gotError;
	try {
		await exec({});
	} catch (e) {
		gotError = e;
	}
	expect(gotError.message).toBe("401: Unauthorized");
	expect(mockPromoteToRealAccountCallArgs).toEqual([]);
});

test("Success when logged in", async () => {
	sessionData = {
		user_id: 123456,
	};
	const result = await exec({});
	expect(result).toEqual({});
	expect(mockPromoteToRealAccountCallArgs.length).toBe(1);
	expect(mockPromoteToRealAccountCallArgs[0][1]).toBe(123456);
});
