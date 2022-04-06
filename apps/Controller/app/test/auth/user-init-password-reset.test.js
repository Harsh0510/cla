const userPasswordReset = require("../../core/auth/user-init-password-reset");
const Context = require("../common/Context");

let ctx;
let mockEmailLocked;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;
let mockSendActivateEmail;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	mockEmailLocked = false;
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
	mockSendActivateEmail = async () => {};
}

let BREAK_EMAIL = "break@email.com";
let BREAK_EMAIL2 = "break2@email.com";
let GOOD_EMAIL = "good@email.com";

jest.mock(`../../core/auth/common/isEmailLocked`, () => {
	return function () {
		return mockEmailLocked;
	};
});

jest.mock("../../core/auth/common/sendActivateEmail.js", () => {
	return (...args) => mockSendActivateEmail(...args);
});

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

let emailSend = {
	send: (email1, email2) => {
		return new Promise((resolve, reject) => {
			if (email1 === GOOD_EMAIL) {
				resolve({});
			} else {
				reject(new Error("Could not reset password [2]"));
			}
		});
	},
	sendTemplate: (email1, email2) => {
		return new Promise((resolve, reject) => {
			if (email2 === GOOD_EMAIL) {
				resolve({});
			} else {
				reject(new Error("Could not reset password [2]"));
			}
		});
	},
};

async function passwordReset(data) {
	let err = null;
	try {
		ctx.body = await userPasswordReset(data, ctx, emailSend);
	} catch (e) {
		err = e;
	}
	return err;
}

function getValidData() {
	return {
		token: "aefaefaefaefaefaefaefaefaefaef254679",
		email: "email@email.com",
	};
}

test("no email provided", async () => {
	let data = getValidData();
	delete data.email;
	expect(await passwordReset(data)).toEqual(new Error("400 ::: Email not provided"));
});

test("invalid email data type provided", async () => {
	let data = getValidData();
	data.email = ["an array should not be allowed", "another element"];
	expect(await passwordReset(data)).toEqual(new Error("400 ::: Email invalid"));
	expect(ctx.body).toBeNull();
});

test("malformed email provided", async () => {
	let data = getValidData();
	data.email = "foo_bar_baz";
	expect(await passwordReset(data)).toEqual(new Error("400 ::: Email not valid"));
	expect(ctx.body).toBeNull();
});

test(`Failed to confirm`, async () => {
	ctx.appDbQuery = (query, values) => {
		query = query.trim();
		return new Promise((resolve, reject) => {
			const email = values[1];
			if (email === GOOD_EMAIL) {
				resolve({ result: true });
			} else {
				reject(new Error("Could not reset password"));
				//throw new Error('Could not reset password');
			}
		});
	};
	let data = getValidData();
	data.email = BREAK_EMAIL2;
	expect(await passwordReset(data)).toEqual(new Error("Could not reset password"));
});

test(`Successfully changed email`, async () => {
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("cla_user") !== -1) {
			return { rows: [{ school_id: 5 }], rowCount: 1 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = GOOD_EMAIL;
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`Error while send email`, async () => {
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("cla_user") !== -1) {
			return { rows: [{ school_id: 5 }], rowCount: 1 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = BREAK_EMAIL2;
	expect(await passwordReset(data)).toEqual(new Error("Could not reset password [2]"));
	expect(ctx.body).toBeNull();
});

test(`API should return TRUE even when no password reset is sent for non-logged in users`, async () => {
	ctx.sessionData = Object.create(null);
	ctx.sessionData.user_role = null;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("cla_user") !== -1) {
			return { rowCount: 0 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = GOOD_EMAIL;
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`API should return TRUE even when no password reset is sent for teachers`, async () => {
	ctx.sessionData.user_role = "teacher";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("cla_user") !== -1) {
			return { rowCount: 0 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = GOOD_EMAIL;
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`API should return FALSE when no password reset is sent, but only for cla-admins`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("cla_user") !== -1) {
			return { rowCount: 0 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = GOOD_EMAIL;
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: false });
});

test(`API should return TRUE when password reset is successfully sent for a user (for school admins)`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 9;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("cla_user") !== -1) {
			return { rows: [{ school_id: 5 }], rowCount: 1 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = GOOD_EMAIL;
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`API should return TRUE when no password reset is sent for a user in a different school for school admins`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 9;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("cla_user") !== -1) {
			if (query.indexOf("UPDATE") >= 0) {
				return { rowCount: 0 };
			}
			return { rows: [{ school_id: 12345 }], rowCount: 1 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = GOOD_EMAIL;
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`API should return TRUE when no password reset is sent because user isn't found (for school admins)`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 9;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("cla_user") !== -1) {
			return { rowCount: 0 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = GOOD_EMAIL;
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`API should return FALSE when no password reset is sent and that user is in the school admin's school (for school admins)`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 9;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("cla_user") !== -1) {
			if (query.indexOf("UPDATE") >= 0) {
				return { rowCount: 0 };
			}
			return { rows: [{ school_id: 9 }], rowCount: 1 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = GOOD_EMAIL;
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: false });
});

test("when cla-admin reset password of a temporary locked email", async () => {
	let data = getValidData();
	ctx.sessionData.user_role = "cla-admin";
	mockEmailLocked = true;
	expect(await passwordReset(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: false,
		message: "Email account temporarily locked",
	});
});

test("when school-admin reset password of a temporary locked email", async () => {
	let data = getValidData();
	ctx.sessionData.user_role = "school-admin";
	mockEmailLocked = true;
	expect(await passwordReset(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: false,
		message: "Email account temporarily locked",
	});
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 9;
	ctx.appDbQuery = async function (query, values) {
		query = query.trim().replace(/[\s\t\n\r]+/g, " ");
		if (query.indexOf("UPDATE cla_user SET") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return { rows: [{ school_id: 5 }], rowCount: 1 };
		}
		throw new Error("should never get here");
	};

	let data = getValidData();
	data.email = GOOD_EMAIL;
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});

test("When user is unregistered and tries to reset password via forget password", async () => {
	let data = getValidData();
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AND password_hash IS NOT NULL")) {
			return { rows: [], rowCount: 0 };
		}
		if (query.includes("AND password_hash IS NULL")) {
			return { rows: [{ school_id: 5 }], rowCount: 1 };
		}
		if (query.includes("SELECT name FROM school")) {
			return { rows: [{ name: "test school" }] };
		}
		throw new Error("should never get here");
	};
	expect(await passwordReset(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
	expect(ctx.responseStatus).toEqual(200);
});
