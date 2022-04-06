const resendSetPasswordUpdateRaw = require("../../core/auth/user-resend-set-password");
const Context = require("../common/Context");

let ctx, mockSendEmail;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

jest.mock("#tvf-util", () => {
	const tvfUtil = {
		generateObjectIdentifier: async () => "abc123",
	};

	return tvfUtil;
});

jest.mock("../../core/auth/common/sendSetPasswordEmail", () => {
	return function () {
		if (mockSendEmail) {
			return mockSendEmail;
		}
		throw new Error();
	};
});

function getValidRequest() {
	return {
		email: "email@email.com",
		token: "e2c70944ea0f1af22a0188092736893cb1f2",
	};
}

let sendEmail = function (to, from, subject, body) {
	return true;
};

function resetAll() {
	ctx = new Context();
	mockSendEmail = true;
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function resendSetPasswordUpdate(data) {
	let err = null;
	try {
		ctx.body = await resendSetPasswordUpdateRaw(data, ctx, sendEmail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when a school is negattive`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = -1;
	expect(await resendSetPasswordUpdate(data)).toEqual(new Error("400 ::: Institution must not be negative"));
});

test("Error When email is not provided", async () => {
	const data = getValidRequest();
	delete data.email;
	expect(await resendSetPasswordUpdate(data)).toEqual(new Error("400 ::: Email not provided"));
});

test("Error When invalid email data type provided", async () => {
	const data = getValidRequest();
	data.email = ["an array should not be allowed", "another element"];
	expect(await resendSetPasswordUpdate(data)).toEqual(new Error("400 ::: Email invalid"));
});

test("Error When malformed email provided", async () => {
	const data = getValidRequest();
	data.email = "foo_bar_baz";
	expect(await resendSetPasswordUpdate(data)).toEqual(new Error("400 ::: Email not valid"));
});

test(`Error if some sql error occurs`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		throw new Error();
	};
	expect(await resendSetPasswordUpdate(data)).toEqual(new Error("400 ::: Could not resend email [1]"));
});

test(`Return response when cla_user is not update`, async () => {
	const data = getValidRequest();
	ctx.appDbQuery = async function (query, values) {
		return { rowCount: 0 };
	};
	expect(await resendSetPasswordUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: false, user: null });
});

test(`Success when user has been approved and send email too`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await resendSetPasswordUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when user has been approved but not send email`, async () => {
	mockSendEmail = false;
	sendEmail = function (to, from, subject, body) {
		throw new Error();
	};
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await resendSetPasswordUpdate(data)).toEqual(new Error("400 ::: Could not resend email [2]"));
});

test(`Success when user has been approved when user login with cla-admin`, async () => {
	sendEmail = function (to, from, subject, body) {
		return true;
	};
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await resendSetPasswordUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Success when user has been approved when user login with school-admin`, async () => {
	sendEmail = function (to, from, subject, body) {
		return true;
	};
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await resendSetPasswordUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when activation token is invalid and user role is teacher`, async () => {
	const data = getValidRequest();
	data.token = "123456";
	ctx.sessionData.user_role = "teacher";
	expect(await resendSetPasswordUpdate(data)).toEqual(new Error("400 ::: Activation token not valid"));
});

test(`Success when activation token is valid`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	ctx.sessionData.user_role = "teacher";
	expect(await resendSetPasswordUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/[\s\t\n\r]+/g, " ");
		if (query.indexOf("UPDATE cla_user SET") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
	expect(await resendSetPasswordUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
