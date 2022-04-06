const processingLogGetAllRaw = require("../../core/admin/asset-processing-log-get-all");
const Context = require("../common/Context");

let ctx;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	data = {
		sort_field: "id",
		sort_direction: "D",
		limit: 10,
		offset: 0,
		query: "book",
		filter: {
			high_priority: [true, false],
			stage: ["stage1", "stage2"],
			success: [true, false],
		},
	};
	processingLogResults = [
		{
			asset_identifier: "A311138111",
			content: "National Geographic Primary Readers is a high-interest series of beginning reading books that have been developed in consultation",
			date_created: "2021-02-18T06:13:32.326Z",
			high_priority: false,
			id: 4,
			stage: "stage2",
			sub_stage: "stage2.1",
			success: false,
		},
	];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function processingLogGetAll(data) {
	let err = null;
	try {
		ctx.body = await processingLogGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	ctx.sessionData.user_role = null;
	expect(await processingLogGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("not an admin (teacher)", async () => {
	ctx.sessionData.user_role = "teacher";
	expect(await processingLogGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test(`Error when sort_filed not pass`, async () => {
	delete data.sort_field;
	expect(await processingLogGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

test(`Successed sortDirection pass with descending order`, async () => {
	data.sort_direction = "D";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			return { rows: [{ id: 1 }] };
		}
	};
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }], unfiltered_count: 1 });
});

test(`Error when sortDirection is wrong pass`, async () => {
	data.sort_direction = "C";
	expect(await processingLogGetAll(data)).toEqual(new Error("400 ::: Invalid sort direction"));
});

test(`return success result when no limit and offset provided with user cla-admin role`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	delete data.limit;
	delete data.offset;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: processingLogResults,
			};
		}
	};
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: processingLogResults,
		unfiltered_count: 1,
	});
});

test(`return success result when sort direction as D provided with user cla-admin role`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: processingLogResults,
			};
		}
	};
	data.sort_direction = "D";
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: processingLogResults,
		unfiltered_count: 1,
	});
});

test(`return success result when sort direction as A provided with user cla-admin role`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: processingLogResults,
			};
		}
	};
	data.sort_direction = "A";
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: processingLogResults,
		unfiltered_count: 1,
	});
});

test(`Success when user pass filters as blank`, async () => {
	data.filter = {
		high_priority: [],
		stage: [],
		success: [],
	};
	ctx.sessionData.user_role = "cla-admin";

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			limit = values[2];
			offset = values[3];
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, success: true }], unfiltered_count: 1 });
});

test(`Success when user pass query params null`, async () => {
	data.query = null;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: processingLogResults,
			};
		}
	};
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: processingLogResults,
		unfiltered_count: 1,
	});
});

test(`Success when user pass query params string`, async () => {
	data.query = "gg";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: processingLogResults,
			};
		}
	};
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: processingLogResults,
		unfiltered_count: 1,
	});
});

test(`Error when user pass wrong query params`, async () => {
	data.query = 123;
	expect(await processingLogGetAll(data, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Success when user pass filters with success`, async () => {
	let limit,
		offset = null;
	data.filter = {
		success: [true, false],
	};
	ctx.sessionData.user_role = "cla-admin";

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			limit = values[2];
			offset = values[3];
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, success: true }], unfiltered_count: 1 });
});

test(`Error when user pass invalid filter params`, async () => {
	data.filter = [];
	expect(await processingLogGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));

	data.filter = "ABC";
	expect(await processingLogGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toBeNull();
});

test(`Success when user pass filters with high_priority`, async () => {
	data.filter = {
		high_priority: [true, false],
	};
	ctx.sessionData.user_role = "cla-admin";

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			limit = values[2];
			offset = values[3];
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, success: true }], unfiltered_count: 1 });
});

test(`Success when user not pass filters`, async () => {
	delete data.filter;
	ctx.sessionData.user_role = "cla-admin";

	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			limit = values[2];
			offset = values[3];
			return { rows: [{ id: 1, success: true }] };
		}
	};
	expect(await processingLogGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, success: true }], unfiltered_count: 1 });
});
