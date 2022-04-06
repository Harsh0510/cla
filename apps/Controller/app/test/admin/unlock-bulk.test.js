const unlockBulkRaw = require("../../core/admin/unlock-bulk");
const Context = require("../common/Context");

let ctx;
let mockIsIncludeModifyUserIdOnConflict;
let mockIsIncludeDateEditedOnConflict;

/** mock for isbn */
jest.mock("isbn", () => ({
	ISBN: {
		parse(a) {
			let p;
			if (a === "9780008144678" || a === "9781844198177" || a === "9780007138784") {
				p = {
					asIsbn13() {
						return a;
					},
					isValid() {
						return true;
					},
				};
			} else {
				p = {
					isValid() {
						return false;
					},
				};
			}
			return p;
		},
	},
}));

function getValidRequest() {
	return {
		isbns: ["9780008144678", "9781844198177", "9780007138784", "1320007138784", "ader", "abcdef"],
		locations: ["A1", "A2", "A3", "A4", "A5", "A6"],
		school_id: 1,
	};
}

function resetAll() {
	ctx = new Context();
	ctx.doAppQuery = async function (query, values) {
		const dbQuery = query.replace(/\s+/g, " ");
		if (dbQuery.indexOf("cla_user.email AS user_email,") !== -1) {
			return { rows: [{ user_email: "foo@email.com", school_name: "foo school" }] };
		}
		if (dbQuery.indexOf("SELECT name, academic_year_end_month, academic_year_end_day FROM school") !== -1) {
			return { rows: [{ name: "foo school", academic_year_end_month: 7, academic_year_end_day: 28 }] };
		}
		if (dbQuery.indexOf("id, isbn13, alternate_isbn13, pdf_isbn13") !== -1) {
			return {
				rows: [
					{
						id: 1,
						isbn13: "9780008144678",
						alternate_isbn13: "9780008144678",
						pdf_isbn13: "9780008144678",
						title: "xxx",
						publisher_name: "pp1",
					},
					{
						id: 2,
						isbn13: "9781844198177",
						alternate_isbn13: "9781844198177",
						pdf_isbn13: "9780008144678",
						title: "yyy",
						publisher_name: "pp2",
					},
					{
						id: 3,
						isbn13: "9780007138784",
						alternate_isbn13: "9780008144678",
						pdf_isbn13: "9780008144678",
						title: "zzz",
						publisher_name: "pp3",
					},
				],
				rowCount: 3,
			};
		}
		if (dbQuery.indexOf("COALESCE(asset_school_info.is_unlocked, ") !== -1) {
			return {
				rows: [
					{
						asset_id: 1,
						is_unlocked: true,
						expiration_date: "2021-03-30 13:31:41.401347+00",
					},
					{
						asset_id: 2,
						is_unlocked: true,
						expiration_date: "2021-03-30 14:31:05.644587+00",
					},
					{
						asset_id: 3,
						is_unlocked: false,
						expiration_date: "2021-03-31 05:37:48.787218+00",
					},
				],
				rowCount: 3,
			};
		}
		if (dbQuery.indexOf("INSERT INTO unlock_attempt ") !== -1) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
		if (dbQuery.indexOf("INSERT INTO asset_school_info ") !== -1) {
			if (dbQuery.indexOf("ON CONFLICT (school_id, asset_id) DO UPDATE ") !== -1) {
				mockIsIncludeModifyUserIdOnConflict = dbQuery.indexOf("modified_by_user_id") !== -1 ? true : false;
				mockIsIncludeDateEditedOnConflict = dbQuery.indexOf("date_edited") !== -1 ? true : false;
			}
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
		if (
			dbQuery.indexOf(
				"SELECT id, title, authors_log AS authors, description, isbn13 AS isbn13, alternate_isbn13 AS alternate_isbn13, pdf_isbn13 AS pdf_isbn13"
			) !== -1
		) {
			return {
				rows: [
					{
						id: 1,
						title: "test",
						authors: {
							first_name: "devid",
							last_name: "jems",
						},
						description: "test",
						isbn13: "9780008144678",
						alternate_isbn13: "9780008144678",
						pdf_isbn13: "9780008144678",
					},
				],
				rowCount: 1,
			};
		}
		if (dbQuery.indexOf("SELECT id AS extract_id, date_created AS date_created") !== -1) {
			return {
				rows: [
					{
						extract_id: 1,
						date_created: new Date(2019, 5, 25, 10, 55, 0, 0),
					},
				],
				rowCount: 1,
			};
		}
		if (dbQuery.indexOf("UPDATE extract") !== -1) {
			return {
				rows: [],
				rowCount: 0,
			};
		}
	};
	mockIsIncludeModifyUserIdOnConflict = false;
	mockIsIncludeDateEditedOnConflict = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function unlockBulk(data) {
	let err = null;
	try {
		ctx.body = await unlockBulkRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = null;
	expect(await unlockBulk(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("Error when user log in with teacher", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await unlockBulk(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test(`Error when invalid params.location when user role as cla-admin`, async () => {
	const data = getValidRequest();
	data.locations = "location";
	ctx.sessionData.user_role = "cla-admin";
	expect(await unlockBulk(data)).toEqual(new Error("400 ::: Invalid locations provided"));
});

test(`Error when invalid params.location and params.isbn length are different`, async () => {
	const data = getValidRequest();
	data.locations = ["A1", "A2"];
	ctx.sessionData.user_role = "cla-admin";
	expect(await unlockBulk(data)).toEqual(new Error("400 ::: Invalid locations provided"));
});

test(`Error when institution not provided when user role as cla-admin`, async () => {
	const data = getValidRequest();
	delete data.school_id;
	ctx.sessionData.user_role = "cla-admin";
	expect(await unlockBulk(data)).toEqual(new Error("400 ::: school_id not provided"));
});

test("Error when invalid school-id provided when user role as cla-admin", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.school_id = "schoolid1";
	expect(await unlockBulk(data)).toEqual(new Error("400 ::: School invalid"));
});

test("Error when invalid school-id as -35 provided", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.school_id = -35;
	expect(await unlockBulk(data)).toEqual(new Error("400 ::: School must not be negative"));
});

test("Error when ISBN not provided", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	delete data.isbns;
	expect(await unlockBulk(data)).toEqual(new Error("400 ::: No ISBNs found"));
});

test("Error when return user information", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("cla_user.email as user_email") !== -1) {
			return { rows: [] };
		}
	};
	expect(await unlockBulk(data)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test("Error when return asset not found", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("cla_user.email as user_email") !== -1) {
			return { rows: [{ user_email: "foo@email.com", school_name: "foo school" }] };
		}
		if (query.indexOf("id, isbn13 ") !== -1) {
			throw new Error("An unexpected error has occurred");
		}
	};
	expect(await unlockBulk(data)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test("Error when return asset_school_info not found", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("cla_user.email AS user_email") !== -1) {
			return { rows: [{ user_email: "foo@email.com", school_name: "foo school" }] };
		}
		if (query.indexOf("id, isbn13 ") !== -1) {
			return { rows: [{ id: 1, isbn13: "9780008144678" }], rowCount: 1 };
		}
		if (query.indexOf("asset_school_info.asset_id, is_unlocked ") !== -1) {
			throw new Error("An unexpected error has occurred");
		}
	};
	expect(await unlockBulk(data)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test("Error when insert asset_school_info", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("cla_user.email AS user_email") !== -1) {
			return { rows: [{ user_email: "foo@email.com", school_name: "foo school" }] };
		}
		if (query.indexOf("id, isbn13 ") !== -1) {
			return {
				rows: [
					{ id: 1, isbn13: "9780008144678" },
					{ id: 2, isbn13: "9781844198177" },
					{ id: 3, isbn13: "9780007138784" },
				],
				rowCount: 3,
			};
		}
		if (query.indexOf("COALESCE(asset_school_info.is_unlocked, ") !== -1) {
			return {
				rows: [
					{ asset_id: 1, is_unlocked: true },
					{ asset_id: 2, is_unlocked: true },
					{ asset_id: 3, is_unlocked: false },
				],
				rowCount: 3,
			};
		}
		if (query.indexOf("INSERT INTO asset_school_info ") !== -1) {
			throw new Error("An unexpected error has occurred");
		}
	};
	expect(await unlockBulk(data)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test("Error when insert unlock_attempt", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("cla_user.email AS user_email") !== -1) {
			return { rows: [{ user_email: "foo@email.com", school_name: "foo school" }] };
		}
		if (query.indexOf("id, isbn13 ") !== -1) {
			return {
				rows: [
					{ id: 1, isbn13: "9780008144678" },
					{ id: 2, isbn13: "9781844198177" },
					{ id: 3, isbn13: "9780007138784" },
				],
				rowCount: 3,
			};
		}
		if (query.indexOf("COALESCE(asset_school_info.is_unlocked, ") !== -1) {
			return {
				rows: [
					{ asset_id: 1, is_unlocked: true },
					{ asset_id: 2, is_unlocked: true },
					{ asset_id: 3, is_unlocked: false },
				],
				rowCount: 3,
			};
		}
		if (query.indexOf("INSERT INTO asset_school_info ") !== -1) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
		if (query.indexOf("INSERT INTO unlock_attempt ") !== -1) {
			throw new Error("An unexpected error has occurred");
		}
	};
	expect(await unlockBulk(data)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test("Error when return UnlockedTitle", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("cla_user.email AS user_email") !== -1) {
			return { rows: [{ user_email: "foo@email.com", school_name: "foo school" }] };
		}
		if (query.indexOf("id, isbn13 ") !== -1) {
			return {
				rows: [
					{ id: 1, isbn13: "9780008144678" },
					{ id: 2, isbn13: "9781844198177" },
					{ id: 3, isbn13: "9780007138784" },
				],
				rowCount: 3,
			};
		}
		if (query.indexOf("COALESCE(asset_school_info.is_unlocked, ") !== -1) {
			return {
				rows: [
					{ asset_id: 1, is_unlocked: true },
					{ asset_id: 2, is_unlocked: true },
					{ asset_id: 3, is_unlocked: false },
				],
				rowCount: 3,
			};
		}
		if (query.indexOf("INSERT INTO asset_school_info ") !== -1) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
		if (query.indexOf("INSERT INTO unlock_attempt ") !== -1) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
		if (query.indexOf("SELECT id, title, isbn13, authors_log, description FROM  asset") !== -1) {
			throw new Error("An unexpected error has occurred");
		}
	};
	expect(await unlockBulk(data)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test("Success when return UnlockedTitle when user log in with cla-admin", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	expect(await unlockBulk(data)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			unlocked: [
				{
					alternate_isbn13: "9780008144678",
					authors: { first_name: "devid", last_name: "jems" },
					description: "test",
					id: 1,
					isbn13: "9780008144678",
					pdf_isbn13: "9780008144678",
					title: "test",
				},
			],
			errors: [
				{ location: "A4", message: "Invalid ISBN", value: "1320007138784" },
				{ location: "A5", message: "Invalid ISBN", value: "ader" },
				{ location: "A6", message: "Invalid ISBN", value: "abcdef" },
			],
		},
	});
});

test("Success when return UnlockedTitle when user log in with school-admin", async () => {
	ctx.sessionData.user_role = "school-admin";
	const data = getValidRequest();
	expect(await unlockBulk(data)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			unlocked: [
				{
					alternate_isbn13: "9780008144678",
					authors: { first_name: "devid", last_name: "jems" },
					description: "test",
					id: 1,
					isbn13: "9780008144678",
					pdf_isbn13: "9780008144678",
					title: "test",
				},
			],
			errors: [
				{ location: "A4", message: "Invalid ISBN", value: "1320007138784" },
				{ location: "A5", message: "Invalid ISBN", value: "ader" },
				{ location: "A6", message: "Invalid ISBN", value: "abcdef" },
			],
		},
	});
});

test("Success when user passed all invalid isbn and not pass locations", async () => {
	ctx.sessionData.user_role = "school-admin";
	const data = getValidRequest();
	data.isbns = ["1320007138784"];
	delete data.locations;
	expect(await unlockBulk(data)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			unlocked: [],
			errors: [
				{
					location: "(Unknown)",
					message: "Invalid ISBN",
					value: "1320007138784",
				},
			],
		},
	});
});

test("Success when no available Asset found", async () => {
	ctx.sessionData.user_role = "school-admin";
	const data = getValidRequest();
	data.isbns = ["1320007138784", "9780008144678"];
	data.locations = ["A1", "A2"];
	expect(await unlockBulk(data)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			unlocked: [
				{
					alternate_isbn13: "9780008144678",
					authors: {
						first_name: "devid",
						last_name: "jems",
					},
					description: "test",
					id: 1,
					isbn13: "9780008144678",
					pdf_isbn13: "9780008144678",
					title: "test",
				},
			],
			errors: [
				{
					location: "A1",
					message: "Invalid ISBN",
					value: "1320007138784",
				},
			],
		},
	});
});

test("Success when user passed all valid isbn and not pass locations", async () => {
	ctx.sessionData.user_role = "school-admin";
	const data = getValidRequest();
	data.isbns = ["9780008144678"];
	delete data.locations;
	expect(await unlockBulk(data)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			unlocked: [
				{
					alternate_isbn13: "9780008144678",
					authors: {
						first_name: "devid",
						last_name: "jems",
					},
					description: "test",
					isbn13: "9780008144678",
					pdf_isbn13: "9780008144678",
					title: "test",
					id: 1,
				},
			],
			errors: [],
		},
	});
});

test("Ensure when conflict occurs, modified_by_user_id and date_edited fields are updated successfully in database", async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	expect(await unlockBulk(data)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			unlocked: [
				{
					alternate_isbn13: "9780008144678",
					authors: { first_name: "devid", last_name: "jems" },
					description: "test",
					id: 1,
					isbn13: "9780008144678",
					pdf_isbn13: "9780008144678",
					title: "test",
				},
			],
			errors: [
				{ location: "A4", message: "Invalid ISBN", value: "1320007138784" },
				{ location: "A5", message: "Invalid ISBN", value: "ader" },
				{ location: "A6", message: "Invalid ISBN", value: "abcdef" },
			],
		},
	});
	expect(mockIsIncludeModifyUserIdOnConflict).toBe(true);
	expect(mockIsIncludeDateEditedOnConflict).toBe(true);
});
