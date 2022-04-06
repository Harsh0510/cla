const rolloverJobGetAllRaw = require("../../core/admin/rollover-job-get-all");
const Context = require("../common/Context");
let ctx;

function resetAll() {
	ctx = new Context();
	mockUserSessionData = {
		user_role: "cla-admin",
		user_id: 185692,
		school_id: 153,
	};
	ctx.getSessionData = async (_) => {
		return mockUserSessionData;
	};

	ctx.getUserRole = async (_) => {
		return mockUserSessionData.user_role;
	};

	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};
}

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`SELECT COUNT (*)`) !== -1) {
		return { rows: [{ _count_: 1 }] };
	}
	if (query.indexOf(`SELECT rollover_job.id`) !== -1) {
		return { rows: [{ id: 1 }] };
	}
	return;
}

beforeEach(resetAll);
afterEach(resetAll);

async function rolloverJobGetAll(data) {
	let err = null;
	try {
		ctx.body = await rolloverJobGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		sort_field: "name",
		sort_direction: "A",
		limit: 10,
		offset: 0,
		query: "test",
		filter: {
			date_created_begin: 1624905000,
			date_created_end: 1624905000,
			status: ["rollover-email-1"],
		},
	};
}

test(`Error when user is not cla admin`, async () => {
	const params = getGoodParams();
	mockUserSessionData = "teacher";
	expect(await rolloverJobGetAll(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Return data when request is well formed`, async () => {
	const params = getGoodParams();
	expect(await rolloverJobGetAll(params)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }], unfiltered_count: 1 });
});

test(`Error when sort_filed not pass`, async () => {
	const params = getGoodParams();
	delete params.sort_field;
	expect(await rolloverJobGetAll(params)).toEqual(new Error("400 ::: Sort field not found"));
});

test(`Error when sortDirection is wrong pass`, async () => {
	const params = getGoodParams();
	params.sort_direction = "C";
	expect(await rolloverJobGetAll(params)).toEqual(new Error("400 ::: Invalid sort direction"));
});

test(`Successed sortDirection pass with descending order`, async () => {
	const params = getGoodParams();
	params.sort_direction = "D";
	expect(await rolloverJobGetAll(params)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }], unfiltered_count: 1 });
});

test(`Success when user do not pass filters, query, limit and offset`, async () => {
	const params = getGoodParams();
	params.filter = {};
	delete params.limit;
	delete params.offset;
	params.query = "";
	expect(await rolloverJobGetAll(params)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }], unfiltered_count: 1 });
});

test(`Error when user pass invalid filter params`, async () => {
	const params = getGoodParams();
	params.filter = [];
	expect(await rolloverJobGetAll(params)).toEqual(new Error("400 ::: Invalid filter provided"));

	params.filter = "ABC";
	expect(await rolloverJobGetAll(params)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass invalid status filter params`, async () => {
	const params = getGoodParams();
	params.filter = {
		status: "test",
	};
	expect(await rolloverJobGetAll(params)).toEqual(new Error("400 ::: Invalid Status provided"));
});

test(`Error when pass too many filter with cla-admin`, async () => {
	const params = getGoodParams();
	params.query = "test";
	params.filter = {
		status: ["scedueled"],
		date_created_begin: 1624905000,
		date_created_end: 1624905000,
		statusA: [1, 2, 3],
		statusB: [1, 2, 3],
	};
	expect(await rolloverJobGetAll(params)).toEqual(new Error("400 ::: Too many filters provided"));
	expect(ctx.body).toBeNull();
});
