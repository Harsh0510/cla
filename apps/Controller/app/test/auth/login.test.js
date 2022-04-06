const loginRaw = require("../../core/auth/login.js");

let mockLoginAttempt = false;
let mockSessionError = false;
let mockEmailLocked = false;

jest.mock("../../core/auth/common/insertSessionData", () => {
	return function () {
		if (mockSessionError) {
			throw "INSERT SESSION ERROR";
		}
		return "hklwedfuhows";
	};
});

jest.mock("../../core/auth/login-attempt", () => {
	return function () {
		if (mockLoginAttempt) {
			throw "LOGIN ATTEMPT ERROR";
		}
		return true;
	};
});

jest.mock(`../../core/auth/common/isEmailLocked`, () => {
	return function () {
		return mockEmailLocked;
	};
});

const ctx = {};
ctx.assert = function (expr, status, msg) {
	if (expr) {
		return;
	}
	ctx.responseStatus = status;
	throw new Error(`${status} ::: ${msg}`);
};
ctx.throw = function (status, msg) {
	ctx.responseStatus = status;
	throw new Error(`${status} ::: ${msg}`);
};

const BREAK_EMAIL = "break@this.email";
const NOT_FOUND_EMAIL = "not@found.email";
const UNKNOWN_ALGORITHM_EMAIL = "some@other.com";
const GOOD_EMAIL = "good@email.com";

const GOOD_PASSWORD = "abc123";
const BAD_PASSWORD = "bad password";

ctx.appDbQuery = async (query, values) => {
	query = query.trim().replace(/\s+/g, " ");
	const email = values[0];
	const password = values[1];
	if (query.indexOf(`SELECT COUNT(id) AS _count_ FROM login_attempt`) >= 0) {
		if (email == "test@email.com") {
			throw "Something has been wrong!";
		} else if (email === "test2@email.com") {
			return { rows: [{ _count_: 5 }] };
		}
		return { rows: [{ _count_: 1 }] };
	} else if (query.indexOf(`FROM cla_user LEFT JOIN school`) >= 0) {
		if (email == GOOD_EMAIL) {
			return {
				rows: [
					{
						id: 7,
						oid: "OID",
						title: "Mr",
						first_name: "Jane",
						last_name: "Doe",
						role: "teacher",
						password_hash: "7e02aa1d4db78122de2c01386eeeb858e67565725a7c83651a562225a00bfc24",
						password_salt: "e5eef7444d8ec4a1a3a5f7cad6aa0bfd",
						password_algo: "sha256",
						school_id: 3,
						job_title: "Foo",
						email: GOOD_EMAIL,
						school: "Test School",
						name_display_preference: "XXX",
						receive_marketing_emails: false,
						flyout_enabled: false,
						can_copy: true,
						has_verified: false,
						date_created: "a long time ago",
						has_trial_extract_access: false,
						requires_merge_confirmation: false,
						is_fe_user: true,
					},
				],
				rowCount: 1,
			};
		} else if (email == NOT_FOUND_EMAIL || password === BAD_PASSWORD) {
			return {
				rows: [],
			};
		} else if (email == UNKNOWN_ALGORITHM_EMAIL) {
			return {
				rows: [
					{
						id: 7,
						first_name: "Bob",
						last_name: "Smith",
						role: "teacher",
						password_hash: "7e02aa1d4db78122de2c01386eeeb858e67565725a7c83651a562225a00bfc24",
						password_salt: "e5eef7444d8ec4a1a3a5f7cad6aa0bfd",
						password_algo: "UNKNOWN ALGO!",
						school_id: 9,
					},
				],
			};
		} else if (email === BREAK_EMAIL) {
			throw "some kind of error occurred";
		} else if (email === "test1@email.com") {
			return {
				rows: [
					{
						id: 7,
						first_name: "Bob",
						last_name: "Smith",
						role: "teacher",
						password_hash: "7e02aa1d4db78122de2c01386eeeb858e67565725a7c83651a562225a00bfc24",
						password_salt: "e5eef7444d8ec4a1a3a5f7cad6aa0bfd",
						password_algo: "sha256",
						school_id: 0,
						is_security_email_enabled: true,
					},
				],
			};
		}
	}
};

ctx.getAppDbPool = (_) => ({ query: ctx.appDbQuery });

function axiosResolve() {
	return new Promise((resolve, reject) => {
		resolve({
			data: {
				session_token: "hklwedfuhows",
			},
		});
	});
}

function addSessIdToResponse() {
	return new Promise((resolve, reject) => {
		resolve({
			data: {
				session_token: "hklwedfuhows",
			},
		});
	});
}

function getValidRequest() {
	return {
		email: GOOD_EMAIL,
		password: GOOD_PASSWORD,
	};
}

let allowedAlgorithms;

function resetAll() {
	mockSessionError = false;
	mockLoginAttempt = false;
	mockEmailLocked = false;
	ctx.responseStatus = 200;
	ctx.body = null;
	ctx.sessionDbQuery = axiosResolve;
	ctx.addSessIdToResponse = addSessIdToResponse;
	allowedAlgorithms = Object.create(null);
	allowedAlgorithms.sha256 = true;
}

beforeEach(resetAll);
afterEach(resetAll);

/**default send email */
let sendEmail = {
	send: (_) => {},
	sendTemplate: (_) => {},
};

async function login(data) {
	let err = null;
	try {
		ctx.body = await loginRaw(data, ctx, allowedAlgorithms, sendEmail);
	} catch (e) {
		err = e;
	}
	return err;
}

test("no email provided", async () => {
	const data = getValidRequest();
	delete data.email;
	expect(await login(data)).toEqual(new Error("400 ::: Email not provided"));
	expect(ctx.body).toBeNull();
});

test("invalid email data type provided", async () => {
	const data = getValidRequest();
	data.email = 555555; // Not a string - should reject
	expect(await login(data)).toEqual(new Error("400 ::: Email invalid"));
	expect(ctx.body).toBeNull();
});

test("malformed email provided", async () => {
	const data = getValidRequest();
	data.email = "foo_bar_baz"; // Syntactically invalid email
	expect(await login(data)).toEqual(new Error("400 ::: Email not valid"));
	expect(ctx.body).toBeNull();
});

test("no password provided", async () => {
	const data = getValidRequest();
	delete data.password;
	expect(await login(data)).toEqual(new Error("400 ::: Password not provided"));
	expect(ctx.body).toBeNull();
});

test("invalid password provided", async () => {
	const data = getValidRequest();
	data.password = {
		a: 1,
		b: 2,
	};
	expect(await login(data)).toEqual(new Error("400 ::: Password invalid"));
	expect(ctx.body).toBeNull();
});

test("error running sql query to fetch user", async () => {
	const data = getValidRequest();
	data.email = BREAK_EMAIL;
	expect(await login(data)).toEqual("some kind of error occurred");
	expect(ctx.body).toBeNull();
});

test("no user found", async () => {
	const data = getValidRequest();
	data.email = NOT_FOUND_EMAIL;
	expect(await login(data)).toEqual(new Error("400 ::: The email address or password is incorrect."));
	expect(ctx.body).toBeNull();
});

test("correct email but incorrect password", async () => {
	const data = getValidRequest();
	data.password = BAD_PASSWORD;
	expect(await login(data)).toEqual(new Error("400 ::: The email address or password is incorrect."));
	expect(ctx.body).toBeNull();
});

test("session insert fails with error message", async () => {
	const data = getValidRequest();
	mockSessionError = true;
	data.email = GOOD_EMAIL;
	ctx.sessionDbQuery = (_) => {
		throw new Error("some error here");
	};
	expect(await login(data)).toEqual("INSERT SESSION ERROR");
	expect(ctx.body).toBeNull();
});

test('get error message "The email address or password is incorrect." ', async () => {
	const data = getValidRequest();
	data.email = "test1@email.com";
	data.password = GOOD_PASSWORD;
	mockLoginAttempt = false;
	expect(await login(data)).toEqual(new Error("400 ::: The email address or password is incorrect."));
	expect(ctx.body).toBeNull();
});

test("successful login", async () => {
	const data = getValidRequest();
	mockLoginAttempt = false;
	mockSessionError = false;
	ctx.sessionDbQuery = (_) => {
		return new Promise((resolve, reject) => {
			let sessionToken = "hklwedfuhows";
			resolve(sessionToken);
		});
	};
	expect(await login(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({
		oid: "OID",
		my_details: {
			title: "Mr",
			first_name: "Jane",
			last_name: "Doe",
			role: "teacher",
			school_id: 3,
			school: "Test School",
			email: GOOD_EMAIL,
			job_title: "Foo",
			name_display_preference: "XXX",
			receive_marketing_emails: false,
			flyout_enabled: false,
			can_copy: true,
			has_verified: false,
			date_created: "a long time ago",
			has_trial_extract_access: false,
			requires_merge_confirmation: false,
			is_fe_user: true,
		},
	});
});

test("User entered wrong password more than five times", async () => {
	const data = getValidRequest();
	data.email = "test2@email.com";
	data.password = GOOD_PASSWORD;
	mockLoginAttempt = false;
	mockEmailLocked = true;

	expect(await login(data)).toEqual(
		new Error(
			"429 ::: You have reached the maximum number of incorrect login attempts permitted. If there is an account on the Education Platform linked to this email address, this has now been locked. Please try again in 5 minutes."
		)
	);
	expect(ctx.body).toBeNull();
});
