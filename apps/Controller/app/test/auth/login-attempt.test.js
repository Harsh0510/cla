const loginAttemptRaw = require("../../core/auth/login-attempt.js");
const Context = require("../common/Context");

let ctx, isSuccessfulLogin, isSecurityEmailEnabled, mockLookup, mockGeoData;

jest.mock("../../core/auth/common/getLookup", () => {
	return async function () {
		if (mockLookup) {
			return {
				get: () => {
					return mockGeoData;
				},
			};
		} else {
			return false;
		}
	};
});

const sendEmail = function () {
	return true;
};

jest.mock("../../core/auth/common/sendLoginSecurityEmail", () => {
	return function () {
		sendTemplate: (_) => {
			return true;
		};
	};
});

function resetAll() {
	ctx = new Context();
	ctx.responseStatus = 200;
	ctx.body = null;
	mockLookup = null;
	mockGeoData = {
		country: {
			names: {
				en: "england",
			},
		},
	};
	isSuccessfulLogin = false;
	isSecurityEmailEnabled = true;
	ctx._koaCtx = {
		request: {
			header: "user-agent",
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function loginAttempt(email) {
	let err = null;
	try {
		ctx.body = await loginAttemptRaw(ctx, 12345, email, isSuccessfulLogin, isSecurityEmailEnabled, sendEmail);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return "abc@email.com";
}

test("Error when lookup null", async () => {
	mockLookup = false;
	const params = getParams();
	expect(await loginAttempt(params)).toEqual(new Error("500 ::: Error logging in [4]"));
	expect(ctx.body).toBeNull();
});

test("Error loggin when user try to attempt results", async () => {
	mockLookup = true;
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("SELECT location, BOOL_OR(is_successful) AS did_succeed FROM login_attempt WHERE email = $1 GROUP BY location") !== -1) {
			throw new Error("500 ::: Error logging in [3]");
		}
	};
	expect(await loginAttempt(params)).toEqual(new Error("500 ::: Error logging in [3]"));
	expect(ctx.body).toBeNull();
});

test("Error when user try to attempt result from location", async () => {
	mockLookup = true;
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("WHERE login_attempt.email = $1 AND login_attempt.is_successful = true") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("SELECT location, BOOL_OR(is_successful) AS did_succeed FROM login_attempt WHERE email = $1 GROUP BY location") !== -1) {
			throw new Error("500 ::: Error logging in [3]");
		}
	};
	expect(await loginAttempt(params)).toEqual(new Error("500 ::: Error logging in [3]"));
	expect(ctx.body).toBeNull();
});

test("Error when user try to attempt login and send email", async () => {
	mockLookup = true;
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("WHERE login_attempt.email = $1 AND login_attempt.is_successful") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("WHERE email = $1 AND user_agent = $2 AND location = $3 AND is_successful = true") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("SELECT location, BOOL_OR(is_successful) AS did_succeed FROM login_attempt WHERE email = $1 GROUP BY location") !== -1) {
			throw new Error("500 ::: Error logging in [2]");
		}
	};
	expect(await loginAttempt(params)).toEqual(new Error("500 ::: Error logging in [2]"));
	expect(ctx.body).toBeNull();
});

test("Successful insert data when user try to attempt login and send email", async () => {
	mockLookup = true;
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("WHERE login_attempt.email = $1 AND login_attempt.is_successful") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("WHERE email = $1 AND user_agent = $2 AND location = $3 AND is_successful = true") !== -1) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.indexOf("SELECT location, BOOL_OR(is_successful) AS did_succeed FROM login_attempt WHERE email = $1 GROUP BY location") !== -1) {
			return { rows: [1] };
		}
	};
	expect(await loginAttempt(params)).toBeNull();
});

test("When lookup return geodata null", async () => {
	mockLookup = true;
	mockGeoData = null;
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("WHERE login_attempt.email = $1 AND login_attempt.is_successful") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("WHERE email = $1 AND user_agent = $2 AND location = $3 AND is_successful = true") !== -1) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.indexOf("SELECT location, BOOL_OR(is_successful) AS did_succeed FROM login_attempt WHERE email = $1 GROUP BY location") !== -1) {
			return { rows: [1] };
		}
	};
	expect(await loginAttempt(params)).toBeNull();
});

test("User successfully logged in", async () => {
	mockLookup = true;
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("WHERE login_attempt.email = $1 AND login_attempt.is_successful") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("WHERE email = $1 AND user_agent = $2 AND location = $3 AND is_successful = true") !== -1) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.indexOf("SELECT location, BOOL_OR(is_successful) AS did_succeed FROM login_attempt WHERE email = $1 GROUP BY location") !== -1) {
			return {
				rowCount: 1,
				rows: [
					{
						location: "",
						did_succeed: true,
					},
				],
			};
		}
		if (query.indexOf("INSERT INTO login_security_token (user_id) VALUES ($1) RETURNING oid") !== -1) {
			return {
				rowCount: 1,
				rows: [
					{
						oid: "123",
					},
				],
			};
		}
	};
	expect(await loginAttempt(params)).toBeNull();
});

test("When user successfully logged in with same location", async () => {
	mockLookup = true;
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("WHERE login_attempt.email = $1 AND login_attempt.is_successful") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("WHERE email = $1 AND user_agent = $2 AND location = $3 AND is_successful = true") !== -1) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.indexOf("SELECT location, BOOL_OR(is_successful) AS did_succeed FROM login_attempt WHERE email = $1 GROUP BY location") !== -1) {
			return {
				rowCount: 1,
				rows: [
					{
						location: "england",
						did_succeed: true,
					},
				],
			};
		}
		if (query.indexOf("INSERT INTO login_security_token (user_id) VALUES ($1) RETURNING oid") !== -1) {
			return {
				rowCount: 1,
				rows: [
					{
						oid: "123",
					},
				],
			};
		}
	};
	expect(await loginAttempt(params)).toBeNull();
});
