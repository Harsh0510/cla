const withAssert = require("#tvf-ensure");
const CarouselGetAllRaw = require("../../core/public/carousel-slide-get-all");
const Context = require("../common/Context");
let mockResult;
async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`FROM carousel_slide`) !== -1) {
		return mockResult;
	}
	return;
}

function resetAll() {
	ctx = new Context();

	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};
	mockResult = {
		rows: [
			{ id: 1, image_url: "https://dummyimage.com/1000x350/ff00e1", image_alt_text: "slider 1", link_url: "https://cla.co.uk/licencetocopy" },
			{ id: 2, image_url: "https://dummyimage.com/1000x350/0033ff", image_alt_text: "slider 2", link_url: "https://cla.co.uk/licencetocopy" },
			{ id: 3, image_url: "https://dummyimage.com/1000x350/26ff00", image_alt_text: "slider 3", link_url: "https://cla.co.uk/licencetocopy" },
		],
	};
	ctx.body = null;
}

async function CarouselGetAll(data) {
	let err = null;
	try {
		ctx.body = await CarouselGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Success`, async () => {
	expect(await CarouselGetAll()).toEqual(null);
	expect(ctx.body).toEqual({ result: mockResult.rows });
	expect(ctx.body.result.length).toBe(3);
});

test(`Success when no data`, async () => {
	mockResult = {
		rows: [],
	};
	expect(await CarouselGetAll()).toEqual(null);
	expect(ctx.body).toEqual({ result: [] });
	expect(ctx.body.result.length).toBe(0);
});
