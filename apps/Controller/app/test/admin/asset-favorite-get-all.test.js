const assetFavoriteGetAllRaw = require("../../core/admin/asset-favorite-get-all");
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

async function assetFavoriteGetAll(data) {
	let err = null;
	try {
		ctx.body = await assetFavoriteGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

//Error when not login
test(`Error when not login`, async () => {
	ctx.sessionData = null;
	const data = getValidRequest();
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
});

//Error when limit is invalid
test(`Error when limit is invalid`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	data.limit = "test";
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Limit invalid"));
});

//Error when limit is negative
test(`Error when limit is negative`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	data.limit = -40;
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Limit must be positive"));
});

//Error when limit is 0
test(`Error when limit is 0`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	data.limit = 0;
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Limit must be positive"));
});

//Error when offset is invalid
test(`Error when offset is invalid`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	data.offset = "test";
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Offset invalid"));
});

//Error when offset is negative
test(`Error when offset is negative`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	data.offset = -40;
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Offset must not be negative"));
});

//Error when sort_direction not pass
test(`Error when sort_direction not pass`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	delete data.sort_direction;
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Sort Direction not provided"));
});

//Error when sort_direction is positive integer number
test(`Error when sort_direction is positive integer number`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	data.sort_direction = 1;
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Sort Direction invalid"));
});

//Error when sort_field not pass
test(`Error when sort_field not pass`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	delete data.sort_field;
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

//Error when sort_field is invalid
test(`Error when sort_field is invalid`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	data.sort_field = "test";
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

//Error when query is invalid
test(`Error when query is invalid`, async () => {
	ctx.sessionData.school_id = 1;
	const data = getValidRequest();
	data.query = 123;
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("400 ::: Query invalid"));
});

//Unknown Error while executing the query
test(`Unknown Error while executing the count query`, async () => {
	ctx.sessionData.user_role = "school teacher";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") == 0) {
			return [];
		} else if (query.indexOf("SELECT") == 0) {
			throw new error("Something has benn wrong");
		}
	};
	const data = getValidRequest();
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("401 ::: Must be associated with an institution"));
});

//Error while executing the result query
test(`Error while executing the result query`, async () => {
	ctx.sessionData.user_role = "school teacher";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") == 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("SELECT") == 0) {
			throw new error("Something has benn wrong");
		}
	};
	const data = getValidRequest();
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("401 ::: Must be associated with an institution"));
});

//Error while executing the result query
test(`Error while executing the result query`, async () => {
	ctx.sessionData.user_role = "school teacher";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") == 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("SELECT") == 0) {
			throw new error("Something has benn wrong");
		}
	};
	const data = getValidRequest();
	expect(await assetFavoriteGetAll(data)).toEqual(new Error("401 ::: Must be associated with an institution"));
});

//Success while executing the result query
test(`Success while executing the result query`, async () => {
	ctx.sessionData.user_role = "school teacher";
	ctx.sessionData.school_id = 1;
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("SELECT") === 0) {
			return { rows: [] };
		}
	};
	const data = getValidRequest();
	expect(await assetFavoriteGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 5 });
});

//Success when not pass the query/limit/offset
test(`Success when not pass the query/limit/offset`, async () => {
	ctx.sessionData.user_role = "school teacher";
	ctx.sessionData.school_id = 1;
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("SELECT") === 0) {
			return { rows: [] };
		}
	};
	const data = getValidRequest();
	delete data.query;
	delete data.limit;
	delete data.offset;
	expect(await assetFavoriteGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 5 });
});

//Success when valid sort_direction as 'D'
test(`Success when sort direct as desc`, async () => {
	ctx.sessionData.user_role = "school teacher";
	ctx.sessionData.school_id = 1;
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("SELECT") === 0) {
			return { rows: [] };
		}
	};
	const data = getValidRequest();
	delete data.query;
	delete data.limit;
	delete data.offset;
	data.sort_direction = "D";
	expect(await assetFavoriteGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 5 });
});

test(`Success when unfilteredCount is 0`, async () => {
	ctx.sessionData.user_role = "school teacher";
	ctx.sessionData.school_id = 1;
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 0 }] };
		} else if (query.indexOf("SELECT") === 0) {
			return { rows: [] };
		}
	};
	const data = getValidRequest();
	delete data.query;
	delete data.limit;
	delete data.offset;
	data.sort_direction = "D";
	expect(await assetFavoriteGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 0 });
});
