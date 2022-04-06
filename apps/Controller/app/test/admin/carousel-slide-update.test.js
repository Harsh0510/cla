const carouselSlideUpdateRaw = require("../../core/admin/carousel-slide-update");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		id: 123,
		name: "slide1",
		date_created: "2021-02-02 05:23:41.909668+00",
		date_edited: "2021-02-02 05:23:41.909668+00",
		enabled: true,
		sort_order: 0,
		image_url: "https://dummyimage.com/1000x300/007aeb/4196e5",
		image_alt_text: "slider1 image not found",
		link_url: "https://dummyimage.com/1000x300/007aeb/4196e5",
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function carouselSlideUpdate(data) {
	let err = null;
	try {
		ctx.body = await carouselSlideUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = null;
	expect(await carouselSlideUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("logged in as teacher/school-admin", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await carouselSlideUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("error when id is not the valid type", async () => {
	const data = getValidRequest();
	data.id = "1"; // should be number
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: ID invalid"));
	expect(ctx.body).toBeNull();
});

test("error when no fields are changed", async () => {
	const data = {
		id: 1,
	};
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: No fields changed"));
	expect(ctx.body).toBeNull();
});

test("Error if name is an empty string", async () => {
	const data = getValidRequest();
	data.name = "";
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Name not provided"));
});

test("Error if name is an invalid string", async () => {
	const data = getValidRequest();
	data.name = 12;
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Name invalid"));
});

test(`Error when user login with cla-admin but pass carousel slide id negative`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.id = -1;
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: ID must not be negative"));
});

test("Error if image url is an empty string", async () => {
	const data = getValidRequest();
	data.image_url = "";
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Image url not provided"));
});

test("Error if image url is invalid string", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.image_url = 1;
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Image url invalid"));
});

test("Success if image_alt_text is an empty string", async () => {
	const data = getValidRequest();
	data.image_alt_text = "";
	expect(await carouselSlideUpdate(data)).toEqual(null);
	expect(ctx.body).toEqual({ result: { edited: true } });
});

test("Error if image_alt_text is an invalid string", async () => {
	const data = getValidRequest();
	data.image_alt_text = 123;
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Image Alt Text should be a string"));
});

test("Success if link_url is an empty string", async () => {
	const data = getValidRequest();
	data.link_url = "";
	expect(await carouselSlideUpdate(data)).toEqual(null);
	expect(ctx.body).toEqual({ result: { edited: true } });
});

test("Error if link_url is invalid string", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.link_url = 1;
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Link Url should be a string"));
});

test("Error if enabled is an empty string", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.enabled = "";
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: enabled should be a boolean"));
});

test("Error if sort_order is an empty string", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.sort_order = "";
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Sort Order should be a positive real type"));
});

test("Error if sort_order is not positive integer no.", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.sort_order = -3;
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Sort Order should be a positive real type"));
});

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await carouselSlideUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: { edited: true } });
});

test("Error if the carousel slide id is not found in the database", async () => {
	const data = getValidRequest();
	data.id = 10;
	ctx.doAppQuery = (query) => {
		return { rows: [], rowCount: 0 };
	};
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Carousel slide not found"));
});

test("Error if name having more then 255 characters string", async () => {
	const data = getValidRequest();
	data.name = "a".repeat(256);
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: Name must be between 1 and 255 characters"));
});

test(`Error when query throws an error a craousel slide name alredy exists`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		throw new Error(`duplicate key value violates unique constraint "XXX"`);
	};
	expect(await carouselSlideUpdate(data)).toEqual(new Error("400 ::: A carousel with that panel name already exists"));
});
