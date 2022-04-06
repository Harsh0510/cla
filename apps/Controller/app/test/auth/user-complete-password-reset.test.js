const userCompletePasswordReset = require("../../core/auth/user-complete-password-reset");

let ctx,
	mockSendEmail,
	mockAddDefaultClassResult = true;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;
jest.mock("../../core/auth/common/addDefaultClass", () => {
	return async function () {
		return mockAddDefaultClassResult;
	};
});

let BREAK_TOKEN = "aefaefaefaefaefaefaefaefaefaef254afa";
let GOOD_TOKEN = "aefaefaefaefaefaefaefaefaefaef254679";
ctx = {
	assert(expr, status, msg) {
		if (expr) {
			return;
		}
		ctx.responseStatus = status;
		throw new Error(`${status} ::: ${msg}`);
	},
	throw(status, msg) {
		ctx.responseStatus = status;
		throw new Error(`${status} ::: ${msg}`);
	},
	responseStatus: 200,
};

let sendEmail = {
	sendTemplate: (_) => {
		if (mockSendEmail) {
			return true;
		}
		throw new Error();
	},
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx.responseStatus = 200;
	mockSendEmail = true;
	(mockAddDefaultClassResult = true),
		(ctx.appDbQuery = async (query, values) => {
			const token = values[0];
			query = query.trim().replace(/\s+/g, " ");
			if (token === BREAK_TOKEN) {
				if (query.indexOf("SELECT id") != -1) {
					return {
						rowCount: 1,
						rows: [
							{
								id: 1,
								token_exists: true,
								is_token_expired: false,
								title: "Mr",
								last_name: "joe",
								default_class_year_group: "General",
								default_class_exam_board: "CIE",
								school_id: 3,
								status: "pending",
							},
						],
					};
				} else if (query.indexOf("UPDATE ") != -1) {
					return new Error("Error");
				}
			} else if (token === GOOD_TOKEN) {
				if (query.indexOf("SELECT id") != -1) {
					return { rowCount: 1, rows: [{ id: 1, token_exists: true, is_token_expired: false }] };
				} else if (query.indexOf("UPDATE ") != -1) {
					return { rowCount: 1, rows: [{ email: "abc@email.com" }] };
				}
			} else {
				reject(new Error("Could not set password"));
			}
		});
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

ctx.appDbQuery = (query, values) => {
	return new Promise((resolve, reject) => {
		const token = values[3];
		if (token === GOOD_TOKEN) {
			resolve({ rowCount: 100, rows: ["email@email.com"] });
		} else {
			reject(new Error("Could not set password"));
		}
	});
};

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function resetPassword(data) {
	let err = null;
	try {
		ctx.body = await userCompletePasswordReset(data, ctx, async (_) => ({ hash: "ads", salt: "aege", algo: "asf" }), sendEmail);
	} catch (e) {
		err = e;
	}
	return err;
}

function getValidData() {
	return {
		token: "aefaefaefaefaefaefaefaefaefaef254679",
		password: "hsyhrUjyrthi78uhj%",
		password_confirm: "hsyhrUjyrthi78uhj%",
	};
}

test(`No token provided`, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	delete data.token;
	expect(await resetPassword(data)).toEqual(new Error("400 ::: Token not provided"));
});

test(`Invalid token`, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	data.token = "wrong";
	expect(await resetPassword(data)).toEqual(new Error("400 ::: Token not valid"));
});

test(`Error token expired`, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	data.token = GOOD_TOKEN;

	ctx.appDbQuery = (query, values) => {
		return new Promise((resolve, reject) => {
			query = query.trim().replace(/\s+/g, " ");
			if (query.indexOf("SELECT id") != -1) {
				resolve({ rowCount: 1, rows: [{ id: 1, is_token_expired: true }] });
			}
		});
	};

	expect(await resetPassword(data)).toEqual(new Error("400 ::: Token Expired"));
});

test(`Weak password`, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	data.password = "weak";
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT id") != -1) {
			return { rowCount: 1, rows: [{ id: 1, token_exists: true, is_token_expired: false }] };
		}
	};
	expect(await resetPassword(data)).toEqual(new Error("400 ::: Password must be at least 8 characters."));
});

test(`Passwords don't match`, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	data.password_confirm = "something_else";
	expect(await resetPassword(data)).toEqual(new Error("400 ::: Passwords don't match"));
});

test(`Failed to reset password`, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	data.token = BREAK_TOKEN;
	ctx.appDbQuery = async (query, values) => {
		const token = values[0];
		query = query.trim().replace(/\s+/g, " ");

		if (query.indexOf("SELECT id") != -1) {
			return {
				rowCount: 1,
				rows: [
					{
						id: 1,
						token_exists: true,
						is_token_expired: false,
						title: "Mr",
						last_name: "joe",
						default_class_year_group: "General",
						default_class_exam_board: "CIE",
						school_id: 3,
						status: "pending",
					},
				],
			};
		} else if (query.indexOf("UPDATE ") != -1) {
			throw new Error("Error");
		}
	};
	expect(await resetPassword(data)).toEqual(new Error("Error"));
});

test(`Successfully reset password`, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	data.token = GOOD_TOKEN;
	ctx.appDbQuery = async (query, values) => {
		const token = values[0];
		query = query.trim().replace(/\s+/g, " ");

		if (query.indexOf("SELECT id") != -1) {
			return {
				rowCount: 1,
				rows: [
					{
						id: 1,
						token_exists: true,
						is_token_expired: false,
						title: "Mr",
						last_name: "joe",
						default_class_year_group: "General",
						default_class_exam_board: "CIE",
						school_id: 3,
						status: "pending",
					},
				],
			};
		} else if (query.indexOf("UPDATE ") != -1) {
			return { rowCount: 1, rows: [{ email: "abc@email.com" }] };
		}
	};
	expect(await resetPassword(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`When reset password update return count 0 and results return false`, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	data.token = GOOD_TOKEN;
	ctx.appDbQuery = async (query, values) => {
		const token = values[0];
		query = query.trim().replace(/\s+/g, " ");

		if (query.indexOf("SELECT id") != -1) {
			return {
				rowCount: 1,
				rows: [
					{
						id: 1,
						token_exists: true,
						is_token_expired: false,
						title: "Mr",
						last_name: "joe",
						default_class_year_group: "General",
						default_class_exam_board: "CIE",
						school_id: 3,
						status: "pending",
					},
				],
			};
		} else if (query.indexOf("UPDATE ") != -1) {
			return { rowCount: 0, rows: [] };
		}
	};
	expect(await resetPassword(data)).toBeNull();
	expect(ctx.body).toEqual({ result: false });
});

test(`Successfully Change User Password when user is already registered `, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	data.token = GOOD_TOKEN;
	data.sendEmail = true;
	ctx.appDbQuery = async (query, values) => {
		const token = values[0];
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT id") != -1) {
			return {
				rowCount: 1,
				rows: [
					{
						id: 1,
						token_exists: true,
						is_token_expired: false,
						title: "Mr",
						last_name: "joe",
						default_class_year_group: "General",
						default_class_exam_board: "CIE",
						school_id: 3,
						status: "registered",
					},
				],
			};
		} else if (query.indexOf("UPDATE ") != -1) {
			return { rowCount: 1, rows: [{ email: "sagar.rathod@radixweb.com" }] };
		}
	};
	expect(await resetPassword(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	ctx.getSessionData = async (_) => null;
	let data = getValidData();
	data.token = GOOD_TOKEN;
	ctx.appDbQuery = async (query, values) => {
		const token = values[0];
		query = query.trim().replace(/\s+/g, " ");

		if (query.indexOf("SELECT id") != -1) {
			return {
				rowCount: 1,
				rows: [
					{
						id: 1,
						token_exists: true,
						is_token_expired: false,
						title: "Mr",
						last_name: "joe",
						default_class_year_group: "General",
						default_class_exam_board: "CIE",
						school_id: 3,
						status: "pending",
					},
				],
			};
		} else if (query.indexOf("UPDATE ") != -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return { rowCount: 1, rows: [{ email: "abc@email.com" }] };
		}
	};
	expect(await resetPassword(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
