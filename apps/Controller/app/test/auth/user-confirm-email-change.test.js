const userConfirmEmailChange = require("../../core/auth/user-confirm-email-change");

let ctx;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

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

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx.responseStatus = 200;
	ctx.getSessionData = (_) => {
		return new Promise((resolve, reject) => {
			resolve({ user_id: 100 });
		});
	};
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

let BREAK_TOKEN = "aefaefaefaefaefaefaefaefaefaef254afa";
let GOOD_TOKEN = "aefaefaefaefaefaefaefaefaefaef254679";

ctx.appDbQuery = (query, values) => {
	query = query.trim();
	return new Promise((resolve, reject) => {
		const token = values[0];
		if (token === GOOD_TOKEN) {
			resolve({ rowCount: 10 });
		} else {
			reject(new Error("Unknown error"));
		}
	});
};

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function emailChange(data) {
	let err = null;
	try {
		ctx.body = await userConfirmEmailChange(data, ctx);
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

test(`Unauthorized`, async () => {
	let data = getValidData();
	ctx.getSessionData = (_) =>
		new Promise((resolve, reject) => {
			resolve({});
		});
	delete data.token;
	expect(await emailChange(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`No token provided`, async () => {
	let data = getValidData();
	delete data.token;
	expect(await emailChange(data)).toEqual(new Error("400 ::: Token not provided"));
});

test(`Invalid token`, async () => {
	let data = getValidData();
	data.token = "wrong";
	expect(await emailChange(data)).toEqual(new Error("400 ::: Token not valid"));
});

test(`Failed to confirm`, async () => {
	let data = getValidData();
	data.token = BREAK_TOKEN;
	expect(await emailChange(data)).toEqual(new Error("400 ::: Unknown error"));
});

test(`Successfully changed email`, async () => {
	let data = getValidData();
	data.token = GOOD_TOKEN;
	expect(await emailChange(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	let data = getValidData();
	data.token = GOOD_TOKEN;
	ctx.appDbQuery = (query, values) => {
		query = query.trim().replace(/[\s\t\n\r]+/g, " ");
		if (query.indexOf("UPDATE cla_user SET") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return new Promise((resolve, reject) => {
				const token = values[0];
				if (token === GOOD_TOKEN) {
					resolve({ rowCount: 10 });
				} else {
					reject(new Error("Unknown error"));
				}
			});
		}
	};
	expect(await emailChange(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
