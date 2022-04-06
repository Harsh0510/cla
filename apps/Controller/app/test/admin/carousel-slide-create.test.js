const carouselSlideCreateRaw = require("../../core/admin/carousel-slide-create");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		id: 2,
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

function resetAll() {
	ctx = new Context();
	queryResult = {
		rowCount: 1,
		rows: [{ id: 2 }],
	};
	endpointResult_Success = { created: true, id: 2 };
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("INSERT INTO carousel_slide") === 0) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function carouselSlideCreate(data) {
	let err = null;
	try {
		ctx.body = await carouselSlideCreateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = null;
	expect(await carouselSlideCreate(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("logged in as teacher/school-admin", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await carouselSlideCreate(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("Error if name is an empty string", async () => {
	const data = getValidRequest();
	data.name = "";
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: Name not provided"));
});

test("Error if name is an invalid string", async () => {
	const data = getValidRequest();
	data.name = 12;
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: Name invalid"));
});

test("Error if image url is an empty string", async () => {
	const data = getValidRequest();
	data.image_url = "";
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: Image Url not provided"));
});

test("Error if image url is invalid string", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.image_url = 1;
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: Image Url invalid"));
});

test("Error if image_alt_text is an invalid string", async () => {
	const data = getValidRequest();
	data.image_alt_text = 123;
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: Image Alt Text should be a string"));
});

test("Success if link_url is an empty string", async () => {
	const data = getValidRequest();
	data.link_url = "";
	expect(await carouselSlideCreate(data)).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error if link_url is invalid string", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.link_url = 1;
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: Link Url should be a string"));
});

test("Error if enabled is an empty string", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.enabled = "";
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: Enabled should be a boolean"));
});

test("Error if sort_order is an empty string", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.sort_order = "";
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: Sort Order should be a positive real type"));
});

test("Error if sort_order is not positive integer no.", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.sort_order = -3;
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: Sort Order should be a positive real type"));
});

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("INSERT INTO carousel_slide") === 0) {
			return { rows: [{ id: 1 }], rowCount: 1 };
		}
	};
	expect(await carouselSlideCreate(data)).toBeNull();
	expect(ctx.body).toEqual({ created: true });
});

test(`Error when query throws an error a craousel slide name alredy exists`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("INSERT INTO carousel_slide") === 0) {
			throw new Error(`duplicate key value violates unique constraint "XXX"`);
			s;
		}
	};
	expect(await carouselSlideCreate(data)).toEqual(new Error("400 ::: A carousel with that panel name already exists"));
});

test("Success if image_alt_text is an empty string", async () => {
	const data = getValidRequest();
	data.image_alt_text = "";
	expect(await carouselSlideCreate(data)).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});
