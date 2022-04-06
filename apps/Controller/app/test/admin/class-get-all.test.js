const classGetAllRaw = require("../../core/admin/class-get-all");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		sort_field: "title",
		sort_direction: "A",
		limit: 10,
		offset: 0,
		query: "class A",
		filter: {
			exam_board: ["EdExcel", "AQA", "CCEA"],
			schools: [1, 2, 3],
		},
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function classGetAll(data) {
	let err = null;
	try {
		ctx.body = await classGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("key_stage")) {
			return { rows: [{ id: 1 }] };
		}
	};
	expect(await classGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }], unfiltered_count: 1 });
});

test(`Error when sort_filed not pass`, async () => {
	const data = getValidRequest();
	delete data.sort_field;
	expect(await classGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

test(`Successed sortDirection pass with descending order`, async () => {
	const data = getValidRequest();
	data.sort_direction = "D";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			return { rows: [{ id: 1 }] };
		}
	};
	expect(await classGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }], unfiltered_count: 1 });
});

test(`Error when sortDirection is wrong pass`, async () => {
	const data = getValidRequest();
	data.sort_direction = "C";
	expect(await classGetAll(data)).toEqual(new Error("400 ::: Invalid sort direction"));
});

test(`Return data when user login with teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.school_id = 1;
	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			return { rows: [{ id: 1, is_own: true }] };
		}
	};
	expect(await classGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, is_own: true }], unfiltered_count: 1 });
});

test(`Error when remove userid in session`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.school_id = 1;
	delete ctx.sessionData.user_id;

	expect(await classGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test(`Success when user login with teacher not pass the limit, offset, query and filter values`, async () => {
	let limit,
		offset = null;
	const data = getValidRequest();
	delete data.limit;
	delete data.offset;
	delete data.filter;
	delete data.query;

	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.school_id = 1;
	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			limit = values[1];
			offset = values[2];
			return { rows: [{ id: 1, is_own: true }] };
		}
	};
	expect(await classGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, is_own: true }], unfiltered_count: 1 });
	expect(limit).toEqual(10);
	expect(offset).toEqual(0);
});

test(`Error when user with cla-admin, passes more than 2 filters`, async () => {
	const data = getValidRequest();
	data.filter = {
		exam_board: ["EdExcel", "AQA", "CCEA"],
		schools: [1, 2, 3],
		exam_board_A: [],
		school_A: [],
	};

	expect(await classGetAll(data)).toEqual(new Error("400 ::: Too many filters provided"));
	expect(ctx.body).toBeNull();
});

test(`Success when user pass filters as blank`, async () => {
	let limit,
		offset = null;
	const data = getValidRequest();
	data.filter = {
		exam_board: [],
		schools: [],
	};
	ctx.sessionData.user_role = "cla-admin";
	ctx.sessionData.school_id = 1;

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			limit = values[2];
			offset = values[3];
			return { rows: [{ id: 1, is_own: true }] };
		}
	};
	expect(await classGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, is_own: true }], unfiltered_count: 1 });
});

test(`Success when user pass filters with schools`, async () => {
	let limit,
		offset = null;
	const data = getValidRequest();
	data.filter = {
		schools: [1, 2, 3],
	};
	ctx.sessionData.user_role = "cla-admin";
	ctx.sessionData.school_id = 1;

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			limit = values[2];
			offset = values[3];
			return { rows: [{ id: 1, is_own: true }] };
		}
	};
	expect(await classGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, is_own: true }], unfiltered_count: 1 });
});

test(`Error when user pass invalid filter params`, async () => {
	const data = getValidRequest();
	data.filter = [];
	expect(await classGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));

	data.filter = "ABC";
	expect(await classGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass invalid exam_board filter params`, async () => {
	ctx.sessionData.user_role = "school-admin";
	const data = getValidRequest();
	data.filter = {
		exam_board: "exam_board",
	};
	expect(await classGetAll(data)).toEqual(new Error("400 ::: Invalid Exam board provided"));
});

test(`Error when user pass invalid schools filter params`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.filter = {
		schools: "schools",
	};
	expect(await classGetAll(data)).toEqual(new Error("400 ::: Invalid schools provided"));
});

test(`Error when pass too many filter with cla-admin`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.query = "School";
	data.filter = {
		exam_board: ["EdExcel", "AQA", "CCEA"],
		schools: [1, 2, 3],
		exam_boardA: ["EdExcel", "AQA", "CCEA"],
		exam_boardB: ["EdExcel", "AQA", "CCEA"],
	};
	expect(await classGetAll(data)).toEqual(new Error("400 ::: Too many filters provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when pass too many filter with school-admin`, async () => {
	ctx.sessionData.user_role = "school-admin";
	const data = getValidRequest();
	data.filter = {
		exam_board: ["EdExcel", "AQA", "CCEA"],
		schools: [1, 2, 3],
		exam_boardA: ["EdExcel", "AQA", "CCEA"],
	};
	expect(await classGetAll(data)).toEqual(new Error("400 ::: Too many filters provided"));
	expect(ctx.body).toBeNull();
});
