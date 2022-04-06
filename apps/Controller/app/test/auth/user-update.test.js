const userUpdateRaw = require("../../core/auth/user-update");
const Context = require("../common/Context");

/**get default values */
function getValidRequest() {
	return {
		current_email: "aaa@bbb.ccc",
		school_id: 1,
		email: "test1@email.com",
		first_name: "foo",
		last_name: "foolastname",
		role: "cla-admin",
		title: "Mr",
	};
}

/**default send email */
let defaultSendEmail = {
	send: (_) => {},
	sendTemplate: (_) => {},
};
let mockIsIncludeDateEditedAndEmail;
let mockIsIncludeModifyUserIdAndEmail;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

/** reset values */
function resetAll() {
	ctx = new Context();
	mockIsIncludeDateEditedAndEmail = false;
	mockIsIncludeModifyUserIdAndEmail = false;
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function userUpdate(data) {
	let err = null;
	try {
		ctx.body = await userUpdateRaw(data, ctx, defaultSendEmail);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData = {};
	ctx.sessionData.user_role = null;
	expect(await userUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("logged in as teacher", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await userUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test(`Error Unauthorized when user role is invalid`, async () => {
	ctx.sessionData.user_role = "test";
	const data = getValidRequest();
	expect(await userUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("error when no fields are changed", async () => {
	const data = {
		current_email: "foo@bar.baz",
	};
	expect(await userUpdate(data)).toEqual(new Error("400 ::: No fields changed"));
	expect(ctx.body).toBeNull();
});

test("no current_email passed", async () => {
	const data = getValidRequest();
	delete data.current_email;
	expect(await userUpdate(data)).toEqual(new Error("400 ::: Current email not provided"));
	expect(ctx.body).toBeNull();
});

test("error when invalid email passed", async () => {
	const data = getValidRequest();
	data.email = 345;
	expect(await userUpdate(data)).toEqual(new Error("400 ::: Email invalid"));
	expect(ctx.body).toBeNull();
});

test("error when invalid first_name passed", async () => {
	const data = getValidRequest();
	data.first_name = 1234;
	expect(await userUpdate(data)).toEqual(new Error("400 ::: First name invalid"));
	expect(ctx.body).toBeNull();
});

test("error when invalid last_name passed", async () => {
	const data = getValidRequest();
	data.last_name = [];
	expect(await userUpdate(data)).toEqual(new Error("400 ::: Last name invalid"));
	expect(ctx.body).toBeNull();
});

test("error when invalid title passed", async () => {
	const data = getValidRequest();
	data.title = 5345;
	expect(await userUpdate(data)).toEqual(new Error("400 ::: Title invalid"));
	expect(ctx.body).toBeNull();
});

test("error when unrecognised title passed", async () => {
	const data = getValidRequest();
	data.title = "does not exist";
	expect(await userUpdate(data)).toEqual(new Error("400 ::: Title not found"));
	expect(ctx.body).toBeNull();
});

test("error when invalid role passed", async () => {
	const data = getValidRequest();
	data.role = { not: "a role" };
	expect(await userUpdate(data)).toEqual(new Error("400 ::: Role invalid"));
	expect(ctx.body).toBeNull();
});

test("error when non-existent role passed", async () => {
	const data = getValidRequest();
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("AS can_edit") >= 0) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM cla_role WHERE code = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 0,
					},
				],
			};
		}
	};
	expect(await userUpdate(data, ctx)).toEqual(new Error("400 ::: Role not found"));
	expect(ctx.body).toBeNull();
	expect(found).toBe(true);
	expect(ctx.responseStatus).toEqual(400);
});

test("error when non-existent user passed", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = {
		current_email: `aaa@bbb.ccc`,
		email: `new@email.here`,
		school_id: 3,
	};
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM school WHERE id = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 1, // school found
					},
				],
			};
		} else if (query.indexOf(`UPDATE cla_user SET pending_email = NULL`) !== -1) {
			return {
				rowCount: 0, // user does not exist
			};
		} else if (query.indexOf(`UPDATE cla_user SET`) !== -1) {
			found = true;
			return {
				rowCount: 0, // user does not exist
			};
		} else if (
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1` ||
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1`
		) {
			return {
				rows: [
					{
						_count_: 0,
					},
				],
			};
		}
	};
	let sendEmailCalled = false;
	expect(await userUpdate(data, ctx, defaultSendEmail)).toEqual(new Error("400 ::: User not found"));
	expect(found).toBe(true);
	expect(sendEmailCalled).toBe(false);
	expect(ctx.body).toBeNull();
	expect(ctx.responseStatus).toEqual(400);
});

test("succeed when valid user", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = {
		current_email: `aaa@bbb.ccc`,
		email: `new@email.here`,
		school_id: 3,
	};
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM school WHERE id = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 1,
					},
				],
			};
		} else if (query.indexOf(`UPDATE cla_user SET pending_email = NULL`) !== -1) {
			return {
				rowCount: 1,
			};
		} else if (query.indexOf(`UPDATE cla_user SET`) !== -1) {
			found = true;
			return {
				rowCount: 1,
			};
		} else if (
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1` ||
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1`
		) {
			return {
				rows: [
					{
						_count_: 0,
					},
				],
			};
		}
	};
	expect(await userUpdate(data, ctx, defaultSendEmail)).toBeNull();
	expect(found).toBe(true);
	expect(ctx.body).toEqual({ result: true });
	expect(ctx.responseStatus).toEqual(200);
});

test("succeed when valid new email passed (as school admin)", async () => {
	ctx.sessionData.user_role = "school-admin";
	const data = {
		current_email: `aaa@bbb.ccc`,
		email: `new@email.here`,
	};
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM school WHERE id = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 1, //School found
					},
				],
			};
		} else if (query.indexOf(`UPDATE cla_user SET pending_email = NULL`) !== -1) {
			found = true;
			return {
				rowCount: 1, // user exist
			};
		} else if (query.indexOf(`UPDATE cla_user SET`) !== -1) {
			found = true;
			return {
				rowCount: 1, // user exist
			};
		} else if (
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1` ||
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1`
		) {
			return {
				rows: [
					{
						_count_: 0, // no user with new email and pending_email
					},
				],
			};
		}
	};

	expect(await userUpdate(data, ctx, defaultSendEmail)).toBeNull();
	expect(found).toBe(true);
	expect(ctx.body).toEqual({ result: true });
	expect(ctx.responseStatus).toEqual(200);
});

test("succeed when valid new email passed (as cla-admin)", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = {
		current_email: `aaa@bbb.ccc`,
		email: `new@email.here`,
	};
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM school WHERE id = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 1, // School found
					},
				],
			};
		} else if (query.indexOf(`UPDATE cla_user SET pending_email = NULL`) !== -1) {
			found = true;
			return {
				rowCount: 1, // user exist
			};
		} else if (query.indexOf(`UPDATE cla_user SET`) !== -1) {
			found = true;
			return {
				rowCount: 1, // user exist
			};
		} else if (
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1` ||
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1`
		) {
			return {
				rows: [
					{
						_count_: 0,
					},
				],
			};
		}
	};
	expect(await userUpdate(data, ctx, defaultSendEmail)).toBeNull();
	expect(found).toBe(true);
	expect(ctx.body).toEqual({ result: true });
	expect(ctx.responseStatus).toEqual(200);
});

test("error when user with provided email exists (main email)", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = {
		current_email: `aaa@bbb.ccc`,
		email: `new@email.here`,
	};
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM school WHERE id = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 1,
					},
				],
			};
		} else if (query.indexOf(`UPDATE cla_user SET pending_email = NULL`) !== -1) {
			found = true;
			return {
				rowCount: 1, // user exist
			};
		} else if (query.indexOf(`UPDATE cla_user SET`) !== -1) {
			found = true;
			return {
				rowCount: 1, // user exist
			};
		} else if (
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1` ||
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1`
		) {
			return {
				rows: [
					{
						_count_: 1, // new email already exists
					},
				],
			};
		}
	};
	expect(await userUpdate(data, ctx, defaultSendEmail)).toEqual(new Error("400 ::: A user with that email address already exists"));
	expect(found).toBe(true);
	expect(ctx.body).toBeNull();
	expect(ctx.responseStatus).toEqual(400);
});

test("error when user with provided email exists (pending email)", async () => {
	const data = {
		current_email: `aaa@bbb.ccc`,
		email: `new@email.here`,
	};
	let found = false;
	ctx.sessionData.user_role = "cla-admin";
	ctx.appDbQuery = async (query, values) => {
		if (query.indexOf(`UPDATE cla_user SET`) !== -1) {
			found = true;
		} else if (query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1`) {
			return {
				rows: [
					{
						_count_: 1,
					},
				],
			};
		} else if (query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1 AND pending_email_expiry > NOW()`) {
			return {
				rows: [
					{
						_count_: 1,
					},
				],
			};
		}
		return {};
	};
	let sendEmailCalled = false;
	expect(
		await userUpdate(data, () => {
			sendEmailCalled = true;
		})
	).toEqual(new Error("400 ::: A user with that email address already exists"));
	expect(found).toBe(false);
	expect(sendEmailCalled).toBe(false);
	expect(ctx.body).toBeNull();
});

test("error School not found by provided valid institution_id", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	delete data.role;
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("AS can_edit") >= 0) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM school WHERE id = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 0, // School not found
					},
				],
			};
		}
	};
	expect(await userUpdate(data, ctx, defaultSendEmail)).toEqual(new Error("400 ::: Institution not found"));
	expect(found).toBe(true);
	expect(ctx.body).toBeNull();
	expect(ctx.responseStatus).toEqual(400);
});

test("error when user with provided email exists (pending email)", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = {
		current_email: `aaa@bbb.ccc`,
		email: `new@email.here`,
	};
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM school WHERE id = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 1,
					},
				],
			};
		} else if (query.indexOf(`UPDATE cla_user SET pending_email = NULL`) !== -1) {
			found = true;
			return {
				rowCount: 1, // user exist
			};
		} else if (query.indexOf(`UPDATE cla_user SET`) !== -1) {
			found = true;
			return {
				rowCount: 1, // user exist
			};
		} else if (query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1`) {
			return {
				rows: [
					{
						_count_: 0, // new email does not exist
					},
				],
			};
		} else if (query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1`) {
			return {
				rows: [
					{
						_count_: 1, // pending email found with new email address
					},
				],
			};
		}
	};
	expect(await userUpdate(data, ctx, defaultSendEmail)).toEqual(new Error("400 ::: A user with that email address already exists"));
	expect(found).toBe(true);
	expect(ctx.body).toBeNull();
	expect(ctx.responseStatus).toEqual(400);
});

test("error could not update when valid user", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = {
		current_email: `aaa@bbb.ccc`,
		email: `new@email.here`,
		school_id: 3,
	};
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM school WHERE id = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 1,
					},
				],
			};
		} else if (query.indexOf(`UPDATE cla_user SET pending_email = NULL`) !== -1) {
			return {
				rowCount: 1, // user exist
			};
		} else if (query.indexOf(`UPDATE cla_user SET`) !== -1) {
			found = true;
			throw new Error("Unknown error"); // error while update the user
		} else if (
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1` ||
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1`
		) {
			return {
				rows: [
					{
						_count_: 0,
					},
				],
			};
		}
	};
	expect(await userUpdate(data, ctx, defaultSendEmail)).toEqual(new Error("400 ::: Could not update user"));
	expect(found).toBe(true);
	expect(ctx.body).toBeNull();
	expect(ctx.responseStatus).toEqual(400);
});

test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = {
		current_email: `aaa@bbb.ccc`,
		email: `new@email.here`,
		school_id: 3,
	};
	let found = false;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf(`SELECT COUNT(*) AS _count_ FROM school WHERE id = $1`) >= 0) {
			found = true;
			return {
				rows: [
					{
						_count_: 1,
					},
				],
			};
		} else if (query.indexOf(`UPDATE cla_user SET pending_email = NULL`) !== -1) {
			mockIsIncludeModifyUserIdAndEmail = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedAndEmail = query.indexOf("date_edited") !== -1 ? true : false;
			return {
				rowCount: 1,
			};
		} else if (query.indexOf(`UPDATE cla_user SET`) !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			found = true;
			return {
				rowCount: 1,
			};
		} else if (
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE email = $1` ||
			query === `SELECT COUNT(*) AS _count_ FROM cla_user WHERE pending_email = $1`
		) {
			return {
				rows: [
					{
						_count_: 0,
					},
				],
			};
		}
	};
	expect(await userUpdate(data, ctx, defaultSendEmail)).toBeNull();
	expect(found).toBe(true);
	expect(ctx.body).toEqual({ result: true });
	expect(ctx.responseStatus).toEqual(200);
	expect(mockIsIncludeDateEditedAndEmail).toBe(true);
	expect(mockIsIncludeModifyUserIdAndEmail).toBe(true);
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
