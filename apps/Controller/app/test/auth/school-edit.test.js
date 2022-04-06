const schoolEditRaw = require("../../core/auth/school-edit");
const Context = require("../common/Context");

let ctx, data;
let mockIsIncludeModifyUserId;
let mockIsIncludeDateEdited;

// simulate getUserRole method on ctx
function defaultGetUserRoleFunctor(role) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(role);
		});
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	data = {
		name: "Test School",
		address1: "375 City Road",
		address2: "Angel",
		city: "London",
		post_code: "EC1V 1NB",
		country: "GB",
		local_authority: "Islington",
		school_level: "high",
		school_home_page: "https://tvf.co.uk",
		number_of_students: 60,
	};
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function schoolEdit(data) {
	let err = null;
	try {
		ctx.body = await schoolEditRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is not a school or cla admin`, async () => {
	ctx.sessionData.user_role = "teacher";
	expect(await schoolEdit(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Return data when request is well formed`, async () => {
	ctx.doAppQuery = (query) => {
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
		return { rows: [], rowCount: 0 };
	};
	expect(await schoolEdit(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Return data when request is well formed (school homepage not provided)`, async () => {
	data.school_home_page = null;
	ctx.doAppQuery = (query) => {
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
		return { rows: [], rowCount: 0 };
	};
	expect(await schoolEdit(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Return data when request is well formed (local authority not provided)`, async () => {
	data.local_authority = null;
	ctx.doAppQuery = (query) => {
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
		return { rows: [], rowCount: 0 };
	};
	expect(await schoolEdit(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when query throws an error`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.doAppQuery = (query) => {
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
		throw new Error("xyz");
	};
	expect(await schoolEdit(data)).toEqual(new Error("xyz"));
	expect(ctx.body).toBeNull();
});

test("Error if no fields are changed", async () => {
	data = {};
	ctx.doAppQuery = (query) => {
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
		return { rows: [], rowCount: 0 };
	};
	expect(await schoolEdit(data)).toEqual(new Error("400 ::: No fields changed"));
	expect(ctx.responseStatus).toEqual(400);
	expect(ctx.body).toBeNull();
});

test("Error if name is an empty string", async () => {
	data.name = "";
	expect(await schoolEdit(data)).toEqual(new Error("400 ::: Name not provided"));
	expect(ctx.responseStatus).toEqual(400);
	expect(ctx.body).toBeNull();
});

test("Error if address1 is an empty string", async () => {
	data.address1 = "";
	expect(await schoolEdit(data)).toEqual(new Error("400 ::: Address (1) not provided"));
	expect(ctx.responseStatus).toEqual(400);
	expect(ctx.body).toBeNull();
});

test("Error if city is an empty string", async () => {
	data.city = "";
	expect(await schoolEdit(data)).toEqual(new Error("400 ::: Town/City not provided"));
	expect(ctx.responseStatus).toEqual(400);
	expect(ctx.body).toBeNull();
});

test("Error if post_code is an empty string", async () => {
	data.post_code = "";
	expect(await schoolEdit(data)).toEqual(new Error("400 ::: Post Code not provided"));
	expect(ctx.responseStatus).toEqual(400);
	expect(ctx.body).toBeNull();
});

test("Error if country is an empty string", async () => {
	data.country = "";
	expect(await schoolEdit(data)).toEqual(new Error("400 ::: Country not provided"));
	expect(ctx.responseStatus).toEqual(400);
	expect(ctx.body).toBeNull();
});

test("Error if institution is an empty string", async () => {
	data.school_level = "";
	expect(await schoolEdit(data)).toEqual(new Error("400 ::: Institution Level not provided"));
	expect(ctx.responseStatus).toEqual(400);
	expect(ctx.body).toBeNull();
});

test("Error if number_of_students is an invalid integer", async () => {
	data.number_of_students = -3;
	expect(await schoolEdit(data)).toEqual(new Error("400 ::: Number of Students must not be negative"));
	expect(ctx.responseStatus).toEqual(400);
	expect(ctx.body).toBeNull();
});

test("Error if number_of_students is an invalid integer", async () => {
	data.number_of_students = -3;
	expect(await schoolEdit(data)).toEqual(new Error("400 ::: Number of Students must not be negative"));
	expect(ctx.responseStatus).toEqual(400);
	expect(ctx.body).toBeNull();
});

test("Success when valid data passed", async () => {
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
		if (query.indexOf("school") !== -1) {
			return {};
		}
		throw new Error("should never get here");
	};
	expect(await schoolEdit(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("Success when valid data passed with pass some data as null", async () => {
	data.local_authority = null;
	data.school_home_page = null;
	data.number_of_students = null;
	let check_local_authority = false;
	let check_school_home_page = false;
	let check_number_of_students = false;
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
		if (query.indexOf("local_authority = NULL") !== -1) {
			check_local_authority = true;
		}
		if (query.indexOf("school_home_page = NULL") !== -1) {
			check_school_home_page = true;
		}
		if (query.indexOf("number_of_students = NULL") !== -1) {
			check_number_of_students = true;
		}
		if (query.indexOf("school") !== -1) {
			return {};
		}
		throw new Error("should never get here");
	};
	expect(await schoolEdit(data)).toBeNull();
	expect(check_local_authority).toEqual(true);
	expect(check_school_home_page).toEqual(true);
	expect(check_number_of_students).toEqual(true);
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	ctx.doAppQuery = (query) => {
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
		if (query.indexOf(`UPDATE school SET`) !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return { rows: [], rowCount: 0 };
		}
	};
	expect(await schoolEdit(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeModifyUserId).toBe(true);
	expect(mockIsIncludeDateEdited).toBe(true);
});
