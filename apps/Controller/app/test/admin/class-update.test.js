const classUpdateRaw = require("../../core/admin/class-update");
const Context = require("../common/Context");

let ctx;
let mockIsIncludeModifyUserId;
let mockIsIncludeDateEdited;

const GOOD_OID = "1cfdfc7541b51b7d61ff70cced0594991d4e";

function getValidRequest() {
	return {
		oid: GOOD_OID,
		title: "Psychology101",
		year_group: "Y12",
		key_stage: "Key Stage 4",
		number_of_students: 20,
		exam_board: "AQA",
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	mockIsIncludeModifyUserId = false;
	mockIsIncludeDateEdited = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function classUpdate(data) {
	let err = null;
	try {
		ctx.body = await classUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		if (query.match(/\bAS[\s\r\n\t]+can_edit\b/)) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.includes("UPDATE")) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
	expect(await classUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: { edited: true } });
});

test(`Error an invalid oid is supplied`, async () => {
	const data = getValidRequest();
	data.oid = "invalid";
	expect(await classUpdate(data)).toEqual(new Error("400 ::: Identifier not valid"));
});

test(`Error when query throws an error`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.doAppQuery = (query) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.includes("UPDATE course")) {
			throw new Error();
		}
		return {
			rows: [],
			rowCount: 0,
		};
	};

	expect(await classUpdate(data)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test("Error if no fields are changed", async () => {
	const data = {
		oid: GOOD_OID,
	};
	expect(await classUpdate(data)).toEqual(new Error("400 ::: No fields changed"));
});

test("Error if title is an empty string", async () => {
	const data = getValidRequest();
	data.title = "";
	expect(await classUpdate(data)).toEqual(new Error("400 ::: Title not provided"));
});

test("Error if key_stage is an empty string", async () => {
	const data = getValidRequest();
	data.key_stage = "";
	expect(await classUpdate(data)).toEqual(new Error("400 ::: Key Stage not provided"));
});

test(`Return data when pass year_group as empty string`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	data.year_group = "";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.includes("UPDATE")) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
	expect(await classUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: { edited: true } });
});

test("Error if number_of_students is not a non negative integer", async () => {
	const data = getValidRequest();
	data.number_of_students = -2;
	expect(await classUpdate(data)).toEqual(new Error("400 ::: Number of Students must not be negative"));
});

test(`Error when query throws an error a class alredy exists`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.indexOf("SELECT") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		}
		throw new Error(`duplicate key value violates unique constraint "XXX"`);
	};
	expect(await classUpdate(data)).toEqual(new Error("400 ::: A class with that name already exists"));
});

test(`Error when query throws an error a class update`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.indexOf("SELECT") === 0) {
			return { rows: [{ count: 1 }], rowCount: 1 };
		}
		throw "Unknown";
	};
	expect(await classUpdate(data)).toEqual(new Error("400 ::: Unknown"));
});

test(`Error when query throws an error if class have active copies`, async () => {
	const data = getValidRequest();
	ctx.appDbQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.includes("oid")) {
			return { rows: [{ _count_: 1 }], rowCount: 1 };
		}
		return { rows: [], rowCount: 0 };
	};
	expect(await classUpdate(data)).toEqual(new Error("400 ::: You may not edit a class that has active copies"));
});

test(`Error when user login with cla-admin but pass institution id negative`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.school_id = -1;
	expect(await classUpdate(data)).toEqual(new Error("400 ::: Institution must not be negative"));
});

test(`Return data when user login with cla-admin but pass school id negative`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.includes("UPDATE")) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
	expect(await classUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: { edited: true } });
});

test(`Return data when user login with teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.user_id = 5;
	ctx.sessionData.school_id = 1;
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.includes("UPDATE")) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
	expect(await classUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: { edited: true } });
});

test(`Return data when pass exam_board as empty string`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	data.exam_board = "";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.includes("UPDATE")) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
	expect(await classUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: { edited: true } });
});

test(`Return data when pass number_of_students as empty string`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.number_of_students = "";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("AS can_edit")) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.includes("UPDATE")) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
	expect(await classUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: { edited: true } });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		if (query.match(/\bAS[\s\r\n\t]+can_edit\b/)) {
			return {
				rows: [{ can_edit: true }],
				rowCount: 1,
			};
		}
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.includes("UPDATE")) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
	expect(await classUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: { edited: true } });
	expect(mockIsIncludeModifyUserId).toEqual(true);
	expect(mockIsIncludeDateEdited).toEqual(true);
});
