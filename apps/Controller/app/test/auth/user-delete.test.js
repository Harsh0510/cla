const userDeleteRaw = require("../../core/auth/user-delete");

const Context = require("../common/Context");

let ctx;

function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

const GOOD_EMAIL = "good@email.com";
const LOGIN_EMAIL = "good1@email.com";

function getValidRequest() {
	return {
		email: GOOD_EMAIL,
	};
}

async function userDelete(data) {
	let err = null;
	try {
		ctx.body = await userDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = null;
	expect(await userDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("not an admin (teacher)", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await userDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("no email provided", async () => {
	const data = getValidRequest();
	delete data.email;
	expect(await userDelete(data)).toEqual(new Error("400 ::: Email not provided"));
	expect(ctx.body).toBeNull();
});

test("invalid email data type provided", async () => {
	const data = getValidRequest();
	data.email = 555555; // Not a string - should reject
	expect(await userDelete(data)).toEqual(new Error("400 ::: Email invalid"));
	expect(ctx.body).toBeNull();
});

test("malformed email provided", async () => {
	const data = getValidRequest();
	data.email = "foo_bar_baz"; // Syntactically invalid email
	expect(await userDelete(data)).toEqual(new Error("400 ::: Email not valid"));
	expect(ctx.body).toBeNull();
});

test("Error when user try to remove them self", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_email = GOOD_EMAIL;
	expect(await userDelete(data)).toEqual(new Error("403 ::: You may not delete yourself"));
	expect(ctx.body).toBeNull();
});

test("error running sql query to fetch user", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = () => {
		throw new Error(`failure`);
	};
	expect(await userDelete(data)).toEqual(new Error("400 ::: Could not delete account"));
	expect(ctx.body).toBeNull();
});

test("user with specified email not found", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		expect(values).toEqual([GOOD_EMAIL]);
		return { rows: [], rowCount: 0 };
	};
	expect(await userDelete(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: false });
});

test("successful deletion as cla admin", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		expect(values).toEqual([GOOD_EMAIL]);
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await userDelete(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("successful deletion as school admin", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 123;
	ctx.doAppQuery = (query, values) => {
		expect(values).toEqual([GOOD_EMAIL, 123]);
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await userDelete(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when running sql query to cla_session`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 123;

	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("DELETE FROM cla_user") !== -1) {
			return { rows: [{ id: 1 }] };
		}
	};

	ctx.doSessionQuery = (query, values) => {
		if (query.indexOf("DELETE FROM cla_session") !== -1) {
			throw new Error(`failure`);
		}
	};

	expect(await userDelete(data)).toEqual(new Error("400 ::: Could not delete account"));
	expect(ctx.body).toBeNull();
});
