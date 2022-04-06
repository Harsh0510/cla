const userApproveUpdateRaw = require("../../core/auth/user-approve");
const Context = require("../common/Context");

let ctx,
	mockfailedEmail = false;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

jest.mock("#tvf-util", () => {
	const tvfUtil = {
		generateObjectIdentifier: async () => "abc123",
	};
	return tvfUtil;
});
jest.mock("../../core/auth/common/sendNewPostApprovalEmail", () => {
	return async function () {
		return true;
	};
});

function getValidRequest() {
	return {
		email: "email@email.com",
		role: "teacher",
	};
}

let sendEmail = function (to, from, subject, body) {
	return true;
};

jest.mock("../../core/auth/common/sendSetPasswordEmail", () => {
	return function () {
		if (mockfailedEmail) {
			throw Error("Some other error");
		}
		return true;
	};
});

function resetAll() {
	ctx = new Context();
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function userApproveUpdate(data) {
	let err = null;
	try {
		ctx.body = await userApproveUpdateRaw(data, ctx, sendEmail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is login with teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await userApproveUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when institution is negative`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = -1;
	expect(await userApproveUpdate(data)).toEqual(new Error("400 ::: Institution must not be negative"));
});

test("Error When email is not provided", async () => {
	const data = getValidRequest();
	delete data.email;
	expect(await userApproveUpdate(data)).toEqual(new Error("400 ::: Email not provided"));
});

test("Error When invalid email data type provided", async () => {
	const data = getValidRequest();
	data.email = ["an array should not be allowed", "another element"];
	expect(await userApproveUpdate(data)).toEqual(new Error("400 ::: Email invalid"));
});

test("Error When malformed email provided", async () => {
	const data = getValidRequest();
	data.email = "foo_bar_baz";
	expect(await userApproveUpdate(data)).toEqual(new Error("400 ::: Email not valid"));
});

test("Error When role is not provided", async () => {
	const data = getValidRequest();
	delete data.role;
	expect(await userApproveUpdate(data)).toEqual(new Error("400 ::: Role not provided"));
});

test("Error When role is invalid", async () => {
	const data = getValidRequest();
	data.role = ["foo"];
	expect(await userApproveUpdate(data)).toEqual(new Error("400 ::: Role invalid"));
});

test("Error When role not found", async () => {
	const data = getValidRequest();
	data.role = "DOES NOT EXIST";
	expect(await userApproveUpdate(data)).toEqual(new Error("400 ::: Role not found"));
});

test(`Error if some sql error occurs`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		throw new Error("Some SQL error");
	};
	expect(await userApproveUpdate(data)).toEqual(new Error("Some SQL error"));
});

test(`Error when user already approved`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		return { rows: [{ id: 0 }], rowCount: 0 };
	};
	expect(await userApproveUpdate(data)).toEqual(new Error("400 ::: User is already approved"));
});

test(`Success when user has been approved and send email too`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		return { rows: [{ id: 0 }], rowCount: 1 };
	};
	expect(await userApproveUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when user has been approved but not send email`, async () => {
	mockfailedEmail = true;
	sendEmail = function (to, from, subject, body) {
		throw new Error("Some other error");
	};
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		return { rows: [{ id: 0 }], rowCount: 1 };
	};
	expect(await userApproveUpdate(data)).toEqual(new Error("Some other error"));
});

test(`Success when user has been approved when user login with cla-admin`, async () => {
	mockfailedEmail = false;
	sendEmail = function (to, from, subject, body) {
		return true;
	};
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		return { rows: [{ id: 0, has_password: true }], rowCount: 1 };
	};
	expect(await userApproveUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Success when user has been approved when user login with school-admin`, async () => {
	mockfailedEmail = false;
	sendEmail = function (to, from, subject, body) {
		return true;
	};
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		return { rows: [{ id: 0 }], rowCount: 1 };
	};
	expect(await userApproveUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("UPDATE cla_user SET") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
		}
		return { rows: [{ id: 0 }], rowCount: 1 };
	};
	expect(await userApproveUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
