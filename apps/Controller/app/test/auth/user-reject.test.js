const userRejectDeleteRaw = require("../../core/auth/user-reject");
const Context = require("../common/Context");

let ctx, mockSendEmail;

function getValidRequest() {
	return {
		email: "email@email.com",
	};
}

let sendEmail = {
	sendTemplate: (_) => {
		if (mockSendEmail) {
			return true;
		}
		throw new Error();
	},
};

function resetAll() {
	ctx = new Context();
	mockSendEmail = true;
}

beforeEach(resetAll);
afterEach(resetAll);

async function userRejectDelete(data) {
	let err = null;
	try {
		ctx.body = await userRejectDeleteRaw(data, ctx, sendEmail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is login with teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await userRejectDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when institution is negative`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = -1;
	expect(await userRejectDelete(data)).toEqual(new Error("400 ::: Institution must not be negative"));
});

test("Error When email is not provided", async () => {
	const data = getValidRequest();
	delete data.email;
	expect(await userRejectDelete(data)).toEqual(new Error("400 ::: Email not provided"));
});

test("Error When invalid email data type provided", async () => {
	const data = getValidRequest();
	data.email = ["an array should not be allowed", "another element"];
	expect(await userRejectDelete(data)).toEqual(new Error("400 ::: Email invalid"));
});

test("Error When malformed email provided", async () => {
	const data = getValidRequest();
	data.email = "foo_bar_baz";
	expect(await userRejectDelete(data)).toEqual(new Error("400 ::: Email not valid"));
});

test(`Error if some sql error occurs`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		throw new Error();
	};
	expect(await userRejectDelete(data)).toEqual(new Error("400 ::: Could not reject user [1]"));
});

test(`Error when user already approved`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 0 }], rowCount: 0 };
	};
	expect(await userRejectDelete(data)).toEqual(new Error("400 ::: Cannot reject already approved user"));
});

test(`Not send email when user alredy approved`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ was_activated: false }], rowCount: 1 };
	};
	expect(await userRejectDelete(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Success when user has been delete and send email too`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ was_activated: true }], rowCount: 1 };
	};
	expect(await userRejectDelete(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when user has been delete but not send email`, async () => {
	mockSendEmail = false;
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ was_activated: true }], rowCount: 1 };
	};
	expect(await userRejectDelete(data)).toEqual(new Error("400 ::: Could not send delete user [2]"));
});

test(`Success when user has been delete when user login with cla-admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ was_activated: true }], rowCount: 1 };
	};
	expect(await userRejectDelete(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Success when user has been approved when user login with school-admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ was_activated: true }], rowCount: 1 };
	};
	expect(await userRejectDelete(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});
