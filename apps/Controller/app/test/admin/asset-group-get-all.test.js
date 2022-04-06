const assetGroupGetAllRaw = require("../../core/admin/asset-group-get-all");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		sort_field: "title",
		sort_direction: "A",
		limit: 10,
		offset: 0,
		query: "test",
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

async function assetGroupGetAll(data) {
	let err = null;
	try {
		ctx.body = await assetGroupGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

//Error when user role is not cla-admin
test(`Error when user role is not cla-admin`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	expect(await assetGroupGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
});

//Error when limit is invalid
test(`Error when limit is invalid`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.limit = "test";
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Limit invalid"));
});

//Error when limit is negative
test(`Error when limit is negative`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.limit = -40;
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Limit must be positive"));
});

//Error when limit is 0
test(`Error when limit is 0`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.limit = 0;
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Limit must be positive"));
});

//Error when offset is invalid
test(`Error when offset is invalid`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.offset = "test";
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Offset invalid"));
});

//Error when offset is negative
test(`Error when offset is negative`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.offset = -40;
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Offset must not be negative"));
});

//Error when sort_direction not pass
test(`Error when sort_direction not pass`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	delete data.sort_direction;
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Sort Direction not provided"));
});

//Error when sort_direction is positive integer number
test(`Error when sort_direction is positive integer number`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.sort_direction = 1;
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Sort Direction invalid"));
});

//Error when sort_direction is invalid
test(`Error when sort_direction is invalid`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.sort_direction = "test";
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Invalid sort direction"));
});

//Error when sort_field not pass
test(`Error when sort_field not pass`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	delete data.sort_field;
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

//Error when sort_field is invalid
test(`Error when sort_field is invalid`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.sort_field = "test";
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

//Error when query is invalid
test(`Error when query is invalid`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.query = 123;
	expect(await assetGroupGetAll(data)).toEqual(new Error("400 ::: Query invalid"));
});

//Unknown Error while executing the result query
test(`Unknown Error while executing the result query`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") == 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("asset_group.identifier AS identifier") >= 0) {
			throw "ERROR123";
		}
	};
	const data = getValidRequest();
	expect(await assetGroupGetAll(data)).toEqual("ERROR123");
});

//Success while executing the result query
test(`Success while executing the result query`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("asset_group.identifier AS identifier") >= 0) {
			return { rows: [] };
		}
	};
	const data = getValidRequest();
	expect(await assetGroupGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 5 });
});

//Success when not pass the query/limit/offset
test(`Success when not pass the query/limit/offset`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("asset_group.identifier AS identifier") >= 0) {
			return { rows: [] };
		}
	};
	const data = getValidRequest();
	delete data.query;
	delete data.limit;
	delete data.offset;
	expect(await assetGroupGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 5 });
});

//Success when valid sort_direction as 'D'
test(`Success when sort direct as desc`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("asset_group.identifier AS identifier") >= 0) {
			return { rows: [] };
		}
	};
	const data = getValidRequest();
	delete data.query;
	delete data.limit;
	delete data.offset;
	data.sort_direction = "D";
	expect(await assetGroupGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 5 });
});
