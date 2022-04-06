const blogPostGet = require("../../core/public/blog-post-get");
const Context = require("../common/Context");

let ctx, rows, mockResult;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	mockResult = {
		rows: [
			{
				id: 4,
				title: "Title4",
				author_name: "author4",
				date_created: "2020-01-04T00:00:00.000Z",
				image_relative_url: "/url4",
			},
		],
	};
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("SELECT") !== -1) {
			return mockResult;
		}
	};
	rows = mockResult.rows[0];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function blogPostGetRaw(data) {
	let err = null;
	try {
		ctx.body = await blogPostGet(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getValidRequest() {
	return {
		limit: 3,
		sort_field: "sort_order",
		sort_direction: "A",
	};
}

test(`Error when limit is not valid`, async () => {
	const data = getValidRequest();
	data.limit = "2";
	expect(await blogPostGetRaw(data)).toEqual(new Error("400 ::: Limit invalid"));
});

test(`Error when order by direction is not valid`, async () => {
	const data = getValidRequest();
	data.sort_direction = 2;
	expect(await blogPostGetRaw(data)).toEqual(new Error("400 ::: Sort Direction invalid"));

	data.sort_direction = "";
	expect(await blogPostGetRaw(data)).toEqual(new Error("400 ::: Sort Direction not provided"));
});

test(`Error when order by column is passed wrong`, async () => {
	const data = getValidRequest();
	data.sort_field = "sortOrder";
	expect(await blogPostGetRaw(data)).toEqual(new Error("400 ::: Sort field not found"));
});

test(`Return data when sort_direction pass with A`, async () => {
	const data = getValidRequest();
	data.sort_direction = "A";
	expect(await blogPostGetRaw(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: [rows],
	});
});

test(`Return data when sort_direction pass with D`, async () => {
	const data = getValidRequest();
	data.sort_direction = "D";
	expect(await blogPostGetRaw(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: [rows],
	});
});

test(`Return data when sort_direction is wrong`, async () => {
	const data = getValidRequest();
	data.sort_direction = "C";
	expect(await blogPostGetRaw(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: [rows],
	});
});

test(`Return data when sort order column is passed`, async () => {
	const data = getValidRequest();
	data.sort_field = "sort_order";
	expect(await blogPostGetRaw(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: [rows],
	});
});

test(`Return data when no params is`, async () => {
	const data = {};
	expect(await blogPostGetRaw(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: [rows],
	});
});
