const updateMyDetailsRaw = require("../../core/auth/update-my-details");
const Context = require("../common/Context");

/**get default values */
function getValidRequest() {
	return {
		email: "admina1@email.com",
		title: "Mr",
		first_name: "abcd",
		last_name: "abcd",
		job_title: "abcd",
		name_display_preference: "test",
		disabled_categories: [1, 2, 3],
		email_opt_out: ["user-not-unlocked-book", "user-not-created-copies", "rollover-email", "multiple-logins-detected", "unlock-notification"],
	};
}

/** reset values */
function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

async function updateMyDetails(data) {
	let err = null;
	try {
		ctx.body = await updateMyDetailsRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_id = 0;
	expect(await updateMyDetails(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("no email passed", async () => {
	const data = getValidRequest();
	delete data.email;
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Email not provided"));
	expect(ctx.body).toBeNull();
});

test("error when invalid email passed", async () => {
	const data = getValidRequest();
	data.email = 345;
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Email invalid"));
	expect(ctx.body).toBeNull();
});

test("error when invalid title passed", async () => {
	const data = getValidRequest();
	data.title = 5345;
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Title invalid"));
	expect(ctx.body).toBeNull();
});

test("error when unrecognised title passed", async () => {
	const data = getValidRequest();
	data.title = "does not exist";
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Title not found"));
	expect(ctx.body).toBeNull();
});

test("error when invalid first_name passed", async () => {
	const data = getValidRequest();
	data.first_name = 1234;
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: First name invalid"));
	expect(ctx.body).toBeNull();
});

test("error when invalid last_name passed", async () => {
	const data = getValidRequest();
	data.last_name = 1234;
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Last name invalid"));
	expect(ctx.body).toBeNull();
});

test("error when no fields are changed", async () => {
	const data = {
		email: "foo@bar.baz",
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: No fields changed"));
	expect(ctx.body).toBeNull();
});

test('error "Copy name invalid" when name_display_preference has the array', async () => {
	const data = {
		email: "foo@bar.baz",
		name_display_preference: ["test"],
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Copy name invalid"));
	expect(ctx.body).toBeNull();
});

test('error "Copy name invalid" when name_display_preference has integer value', async () => {
	const data = {
		email: "foo@bar.baz",
		name_display_preference: 1,
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Copy name invalid"));
	expect(ctx.body).toBeNull();
});

test("error when receive_marketing_emails has integer value", async () => {
	const data = {
		email: "foo@bar.baz",
		receive_marketing_emails: 1,
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Receive Marketing Emails should be a boolean"));
	expect(ctx.body).toBeNull();
});

test('error "Copy name invalid" when name_display_preference has more than 100 character', async () => {
	const data = {
		email: "foo@bar.baz",
		name_display_preference: "ABCDEFGHIJ".repeat(11),
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Your copy name must not exceed 100 characters."));
	expect(ctx.body).toBeNull();
});

test('error "Disabled notification categories invalid" when disabled_categories has string', async () => {
	const data = {
		email: "foo@bar.baz",
		disabled_categories: "test",
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Disabled notification categories invalid"));
	expect(ctx.body).toBeNull();
});

test('error "Disabled notification categories must all be positive integers" when disabled_categories has negative value in array', async () => {
	const data = {
		email: "foo@bar.baz",
		disabled_categories: [-1],
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Disabled notification categories must all be positive integers"));
	expect(ctx.body).toBeNull();
});

test('error "Disabled notification categories must all be positive integers" when disabled_categories has string value in array', async () => {
	const data = {
		email: "foo@bar.baz",
		disabled_categories: [1, "test"],
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Disabled notification categories must all be positive integers"));
	expect(ctx.body).toBeNull();
});

test('error "Too many disabled notification categories provided" when disabled_categories has too many values in array', async () => {
	const data = {
		email: "foo@bar.baz",
		disabled_categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Too many disabled notification categories provided"));
	expect(ctx.body).toBeNull();
});

test('error "Disabled email notification invalid" when email_opt_out has string', async () => {
	const data = {
		email: "foo@bar.baz",
		email_opt_out: "test",
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Disabled email notification invalid"));
	expect(ctx.body).toBeNull();
});

test('error "Too many disabled email notification provided" when email_opt_out has too many values', async () => {
	const data = {
		email: "foo@bar.baz",
		email_opt_out: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Too many disabled email notification provided"));
	expect(ctx.body).toBeNull();
});

test('error "Disabled email notification has invalid values" when email_opt_out has invalid values', async () => {
	const data = {
		email: "foo@bar.baz",
		email_opt_out: [1, 2, 3, 4, "cate1"],
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Disabled email notification has invalid values"));
	expect(ctx.body).toBeNull();
});

test('error "Disabled email notification has duplicate values" when email_opt_out has duplicate values', async () => {
	const data = {
		email: "foo@bar.baz",
		email_opt_out: ["user-not-unlocked-book", "user-not-unlocked-book", "rollover-email"],
	};
	expect(await updateMyDetails(data)).toEqual(new Error("400 ::: Disabled email notification has duplicate values"));
	expect(ctx.body).toBeNull();
});

test("error query for update my-details ", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		throw new Error("Unknown error");
	};
	expect(await updateMyDetails(data)).toEqual(new Error("Unknown error"));
});

test("success when user update the details include flyout_enabled", async () => {
	const data = getValidRequest();
	data.flyout_enabled = true;
	delete data.disabled_categories;
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		return { rows: [{ count: 1 }], rowCount: 1 };
	};
	expect(await updateMyDetails(data, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test("success when user update the details include receive_marketing_emails", async () => {
	const data = getValidRequest();
	data.receive_marketing_emails = true;
	delete data.disabled_categories;
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		return { rows: [{ count: 1 }], rowCount: 1 };
	};
	expect(await updateMyDetails(data, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test("Sucees when user update the detals", async () => {
	const data = getValidRequest();
	delete data.disabled_categories;
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		return { rows: [{ count: 1 }], rowCount: 1 };
	};
	expect(await updateMyDetails(data, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test("Sucees when user update the all detals", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (text, values) => {
		if (text.includes("AS can_edit")) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		if (text.indexOf("SELECT ") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("UPDATE cla_user") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("DELETE FROM user_disabled_notification_categories") === 0) {
			return;
		} else if (text.indexOf("INSERT INTO user_disabled_notification_categories") === 0) {
			return;
		}
	};
	expect(await updateMyDetails(data, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test("Sucees when user update the job title and disabled some categories", async () => {
	const data = {
		email: "admina1@email.com",
		job_title: "abcd",
		disabled_categories: [1],
	};
	ctx.doAppQuery = async (text, values) => {
		if (text.includes("AS can_edit")) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		if (text.indexOf("SELECT ") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("UPDATE cla_user") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("DELETE FROM user_disabled_notification_categories") === 0) {
			return;
		} else if (text.indexOf("INSERT INTO user_disabled_notification_categories") === 0) {
			return;
		}
	};
	expect(await updateMyDetails(data, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test("Sucees when user update the first name and enable all categories", async () => {
	const data = {
		email: "admina1@email.com",
		first_name: "abcd",
		disabled_categories: [],
	};
	ctx.doAppQuery = async (text, values) => {
		if (text.includes("AS can_edit")) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		if (text.indexOf("SELECT ") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("UPDATE cla_user") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("DELETE FROM user_disabled_notification_categories") === 0) {
			return;
		} else if (text.indexOf("INSERT INTO user_disabled_notification_categories") === 0) {
			return;
		}
	};
	expect(await updateMyDetails(data, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test("Sucees when user only disabled some categories", async () => {
	const data = {
		email: "admina1@email.com",
		disabled_categories: [1],
	};
	ctx.doAppQuery = async (text, values) => {
		if (text.includes("AS can_edit")) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		if (text.indexOf("SELECT ") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("UPDATE cla_user") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("DELETE FROM user_disabled_notification_categories") === 0) {
			return;
		} else if (text.indexOf("INSERT INTO user_disabled_notification_categories") === 0) {
			return;
		}
	};
	expect(await updateMyDetails(data, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test("Error thrown", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = async (text, values) => {
		if (text.includes("AS can_edit")) {
			return {
				rows: [
					{
						can_edit: true,
					},
				],
				rowCount: 1,
			};
		}
		if (text.indexOf("SELECT ") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("UPDATE cla_user") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		} else if (text.indexOf("DELETE FROM user_disabled_notification_categories") === 0) {
			return;
		} else if (text.indexOf("INSERT INTO user_disabled_notification_categories") === 0) {
			throw new Error("Error");
		}
	};
	expect(await updateMyDetails(data, ctx)).toEqual(new Error("Error"));
});
