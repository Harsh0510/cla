const carouselSlideDeleteRaw = require("../../core/admin/carousel-slide-delete");

const Context = require("../common/Context");

let ctx;

function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

function getValidRequest() {
	return {
		id: 1,
	};
}

async function carouselSlideDelete(data) {
	let err = null;
	try {
		ctx.body = await carouselSlideDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = null;
	expect(await carouselSlideDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("not an admin (teacher)", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await carouselSlideDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("no id provided", async () => {
	const data = getValidRequest();
	delete data.id;
	expect(await carouselSlideDelete(data)).toEqual(new Error("400 ::: ID invalid"));
	expect(ctx.body).toBeNull();
});

test("invalid id data type provided", async () => {
	const data = carouselSlideDelete();
	data.id = "1"; // Not a number - should reject
	expect(await carouselSlideDelete(data)).toEqual(new Error("400 ::: ID invalid"));
	expect(ctx.body).toBeNull();
});

test("error running sql query to fetch user", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = () => {
		throw new Error(`failure`);
	};
	expect(await carouselSlideDelete(data)).toEqual(new Error("failure"));
	expect(ctx.body).toBeNull();
});

test("carousel slide with specified ID not found", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		expect(values).toEqual([1]);
		return { rows: [], rowCount: 0 };
	};
	expect(await carouselSlideDelete(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: false });
});

test("successful deletion as cla admin", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		expect(values).toEqual([1]);
		return { rows: [], rowCount: 1 };
	};
	expect(await carouselSlideDelete(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});
