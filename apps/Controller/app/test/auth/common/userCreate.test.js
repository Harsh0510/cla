const userCreateRaw = require("../../../core/auth/common/userCreate");
const Context = require("../../common/Context");

let ctx,
	mockSendActivateEmail = false;

function resetAll() {
	ctx = new Context();
}

jest.mock("../../../core/auth/common/sendActivateEmail", () => {
	return function () {
		if (mockSendActivateEmail) {
			throw "error";
		}
		return true;
	};
});

/** Clear everything before and after each test */
beforeEach(resetAll);
afterEach(resetAll);

async function userCreate(data) {
	let err = null;
	try {
		ctx.body = await userCreateRaw(data, ctx, emailSend);
	} catch (e) {
		err = e;
	}
	return err;
}

let emailSend = async (from, to, subject, body) => {
	return true;
};

/** default params for create user */
function getParams() {
	return {
		email: "abc@email.com",
		title: "Mr",
		first_name: "firstname",
		last_name: "lastname",
		role: "teacher",
		school_id: 12,
	};
}

test(`Error Unauthorized when user role as teacher`, async () => {
	ctx.sessionData.user_role = "teacher";
	const params = getParams();
	expect(await userCreate(params, ctx)).toEqual(new Error(`401 ::: Unauthorized`));
});

test(`Error Unauthorized when user role is invalid`, async () => {
	ctx.sessionData.user_role = "test";
	const params = getParams();
	expect(await userCreate(params, ctx)).toEqual(new Error(`401 ::: Unauthorized`));
});

test("no email provided", async () => {
	const params = getParams();
	delete params.email;
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Email not provided"));
});

test("invalid email data type provided", async () => {
	const params = getParams();
	params.email = ["an array should not be allowed", "another element"];
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Email invalid"));
});

test("malformed email provided", async () => {
	const params = getParams();
	params.email = "foo_bar_baz";
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Email not valid"));
	expect(ctx.body).toBeNull();
});

test("no title provided", async () => {
	const params = getParams();
	delete params.title;
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Title not provided"));
});

test("invalid title provided", async () => {
	const params = getParams();
	params.title = "Mister";
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Title not found"));
});

test("no first_name provided", async () => {
	const params = getParams();
	delete params.first_name;
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: First name not provided"));
});

test("no last_name provided", async () => {
	const params = getParams();
	delete params.last_name;
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Last name not provided"));
});

test("no role provided", async () => {
	const params = getParams();
	delete params.role;
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Role not provided"));
});

test("no institution_id-id provided when user role as cla-admin", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const params = getParams();
	delete params.school_id;
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: school_id not provided"));
});

test("invalid institution-id provided when user role as cla-admin", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const params = getParams();
	params.school_id = "schoolid1";
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Institution invalid"));
});

test("invalid institution-id as -35 provided when user role as cla-admin", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const params = getParams();
	params.school_id = -35;
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Institution must not be negative"));
});

test("no school-id provided when user role as school-admin", async () => {
	ctx.sessionData.user_role = "school-admin";
	delete ctx.sessionData.school_id;
	const params = getParams();
	params.school_id = "schoolid1";
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: school_id not provided"));
});

test("invalid institution-id provided when user role as school-admin", async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = "test";
	const params = getParams();
	params.school_id = "schoolid1";
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Institution invalid"));
});

test("invalid institution-id as -125 provided when user role as school-admin", async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = -125;
	const params = getParams();
	params.school_id = "schoolid1";
	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Institution must not be negative"));
});

/**  Error when school-admin try to add the cla-admin user */
test("Error when school-admin try to add the cla-admin user", async () => {
	ctx.sessionData.user_role = "school-admin";
	const params = getParams();
	params.role = "cla-admin";
	expect(await userCreate(params, ctx)).toEqual(new Error("403 ::: You do not have the permission for create the user with cla-admin role."));
});

/** ensure that the supplied role exists */
test('search role with no results should return "Role not found"', async () => {
	let counter = 0;
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("cla_role") !== -1) {
			return { rows: [{ count: 0 }] };
		}
		if (queryText.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ count: 0 }] };
		}
		throw new Error("should never get here");
	};

	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 1;
	const params = getParams();
	params.school_id = 1;

	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Role not found"));
	expect(ctx.body).toEqual(null);
});

/** ensure the supplied school exists */
test('search institution with no results should return "Institution_id not found"', async () => {
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("cla_role") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ count: 0 }] };
		}
		if (queryText.indexOf("SELECT id FROM school") !== -1) {
			return { rows: [] };
		}
		throw new Error("should never get here");
	};

	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 1;
	const params = getParams();
	params.school_id = 1;

	expect(await userCreate(params, ctx)).toEqual(new Error("400 ::: Institution not found"));
	expect(ctx.body).toEqual(null);
});

/** ensure query for insert with no results */
test("error query for insert with no results ", async () => {
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("cla_role") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("SELECT id FROM school") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("cla_user") !== -1) {
			return { rows: [] };
		}
		throw new Error("should never get here");
	};

	ctx.sessionData.user_role = "cla-admin";
	const params = getParams();

	expect(await userCreate(params, ctx)).toEqual(new Error("500 ::: Error creating user [2]"));
	expect(ctx.body).toEqual(null);
});

/** Success query for insert with results */
test("Success query for insert with results", async () => {
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("cla_role") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("SELECT id FROM school") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("cla_user") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("SELECT name FROM school") !== -1) {
			return { rows: [{ name: "Test School" }] };
		}
		throw new Error("should never get here");
	};

	ctx.sessionData.user_role = "cla-admin";
	const params = getParams();

	expect(await userCreate(params, ctx, emailSend)).toEqual(null);
	expect(ctx.body).toEqual({ success: true });
});

/** No pass sendemail function */
test("Error send email", async () => {
	mockSendActivateEmail = true;
	emailSend = async (from, to, subject, body) => {
		throw new Error("Not send successfully");
	};

	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("cla_role") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("SELECT id FROM school") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("cla_user") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		throw new Error("should never get here");
	};

	ctx.sessionData.user_role = "cla-admin";
	const params = getParams();

	expect(await userCreate(params, ctx, emailSend)).toEqual(new Error("400 ::: Could not reset password [3]"));
	expect(ctx.body).toBeNull();
});

/** Error A user with that email already exists */
test("Error A user with that email already exists", async () => {
	mockSendActivateEmail = false;
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("cla_role") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("SELECT id FROM school") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (queryText.indexOf("cla_user") !== -1) {
			throw new Error("Test violates unique constraint  A user with that email already exists");
		}
		throw new Error("should never get here");
	};

	ctx.sessionData.user_role = "cla-admin";
	const params = getParams();

	expect(await userCreate(params, ctx, emailSend)).toEqual(new Error("400 ::: A user with that email already exists"));
	expect(ctx.body).toBeNull();
});
