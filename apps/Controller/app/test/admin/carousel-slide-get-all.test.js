const caoruselSlideGetAllRaw = require("../../core/admin/carousel-slide-get-all");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		sort_field: "name",
		sort_direction: "A",
		limit: 10,
		offset: 0,
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

async function carouselSlideGetAll(data) {
	let err = null;
	try {
		ctx.body = await caoruselSlideGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = null;
	expect(await carouselSlideGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("not an admin (teacher)", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await carouselSlideGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("sort_order")) {
			return { rows: [{ id: 1 }] };
		}
	};
	expect(await carouselSlideGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }], unfilteredCount: 1 });
});

test(`Error when sort_filed not pass`, async () => {
	const data = getValidRequest();
	delete data.sort_field;
	expect(await carouselSlideGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
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
	expect(await carouselSlideGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }], unfilteredCount: 1 });
});

test(`Error when sortDirection is wrong pass`, async () => {
	const data = getValidRequest();
	data.sort_direction = "C";
	expect(await carouselSlideGetAll(data)).toEqual(new Error("400 ::: Invalid sort direction"));
});

test(`Success when user login with CLA admin not pass the limit, offset, query and filter values`, async () => {
	let limit,
		offset = null;
	const data = getValidRequest();
	delete data.limit;
	delete data.offset;

	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.includes("_count_")) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.includes("ORDER BY")) {
			limit = values[0];
			offset = values[1];
			return { rows: [{ id: 1 }] };
		}
	};
	expect(await carouselSlideGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1 }], unfilteredCount: 1 });
	expect(limit).toEqual(10);
	expect(offset).toEqual(0);
});
