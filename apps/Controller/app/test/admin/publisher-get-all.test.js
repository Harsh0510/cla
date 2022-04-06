const publisherGetAllRaw = require("../../core/admin/publisher-get-all");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		limit: 5,
		offset: 0,
		sort_field: "contact_name",
		sort_direction: "A",
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 3 }] };
		}
		return { rows: [{ id: 1 }, { id: 2 }, { id: 3 }], rowCount: 3 };
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function publisherGetAll(data) {
	let err = null;
	try {
		ctx.body = await publisherGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is school-admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	expect(await publisherGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user is teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await publisherGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when sort_field not pass`, async () => {
	const data = getValidRequest();
	delete data.sort_field;
	expect(await publisherGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

test(`Error when sortDirection is wrong pass`, async () => {
	const data = getValidRequest();
	data.sort_direction = "C";
	expect(await publisherGetAll(data)).toEqual(new Error("400 ::: Invalid sort direction"));
});

test(`Return data when sort_direction pass with A `, async () => {
	const data = getValidRequest();
	data.sort_direction = "A";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 10 }] };
		}
		return { rows: [{ id: 0 }], rowCount: 0 };
	};
	expect(await publisherGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 0 }], unfiltered_count: 10 });
});

test(`Error when query return exception`, async () => {
	const data = getValidRequest();
	data.sort_direction = "D";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 3 }] };
		}
		throw new Error();
	};
	expect(await publisherGetAll(data)).toEqual(new Error("400 ::: Unknown error"));
});

test(`Return data when pass data well formed`, async () => {
	const data = getValidRequest();
	data.sort_direction = "D";
	expect(await publisherGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], unfiltered_count: 3 });
});

test(`Success when user pass query params null`, async () => {
	const data = getValidRequest();
	data.query = null;
	data.limit = 1;
	expect(await publisherGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], unfiltered_count: 3 });
});

test(`Error when user pass wrong query params`, async () => {
	const data = getValidRequest();
	data.query = 123;
	expect(await publisherGetAll(data, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Success when user pass query params string`, async () => {
	const data = getValidRequest();
	data.query = "Coordination";
	expect(await publisherGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], unfiltered_count: 3 });
});

test(`Success when user not pass the offset and limit params `, async () => {
	let limit, offset;
	ctx.appDbQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return { rows: [{ _count_: 3 }] };
		}
		limit = values[1];
		offset = values[2];
		return { rows: [{ id: 1 }, { id: 2 }, { id: 3 }], rowCount: 3 };
	};
	const data = getValidRequest();
	data.query = "Coordination";
	delete data.limit;
	delete data.offset;
	expect(await publisherGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], unfiltered_count: 3 });
	expect(limit).toEqual(10);
	expect(offset).toEqual(0);
});

test(`Invalid offset value as "123" provided`, async () => {
	const data = getValidRequest();
	data.limit = "123";
	expect(await publisherGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit invalid`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as -1 provided`, async () => {
	const data = getValidRequest();
	data.limit = -1;
	expect(await publisherGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit must be positive`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as 0 provided`, async () => {
	const data = getValidRequest();
	data.limit = 0;
	expect(await publisherGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit must be positive`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as "123" provided`, async () => {
	const data = getValidRequest();
	data.offset = "123";
	expect(await publisherGetAll(data, ctx)).toEqual(new Error(`400 ::: Offset invalid`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as -1 provided`, async () => {
	const data = getValidRequest();
	data.offset = -1;
	expect(await publisherGetAll(data, ctx)).toEqual(new Error(`400 ::: Offset must not be negative`));
	expect(ctx.body).toBeNull();
});

test(`Unknow error when count all query return exception`, async () => {
	const data = getValidRequest();
	data.sort_direction = "D";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			throw new Error();
		}
		throw new Error();
	};
	expect(await publisherGetAll(data)).toEqual(new Error("400 ::: Unknown error"));
});

test(`Unknow result when count all query return exception`, async () => {
	const data = getValidRequest();
	data.sort_direction = "D";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("_count_") !== -1) {
			return {};
		}
		throw new Error();
	};
	expect(await publisherGetAll(data)).toEqual(new Error("400 ::: Unknown error"));
});
