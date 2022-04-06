const HomeScreenBlogGetCategories = require("../../core/admin/home-screen-blog-get-categories");

let ctx, params, mockResult;

function defaultGetUserRole(role) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(role);
		});
	};
}

function defaultAppDbQuery(query, values) {
	query = query.trim();
	return new Promise((resolve, reject) => {
		if (query.indexOf("SELECT") !== -1) {
			resolve(mockResult);
		}
	});
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockResult = {
		rows: [
			{
				id: 1,
				blog_category_names: ["www.google.com"],
				_count_: 0,
			},
		],
	};
	ctx = {
		assert(expr, status, msg) {
			if (expr) {
				return;
			}
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		throw(status, msg) {
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		responseStatus: 200,
		body: null,
		appDbQuery: defaultAppDbQuery,
		getUserRole: defaultGetUserRole("cla-admin"),
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/** Common function */
async function HomeScreenBlogGetCategoriesRaw() {
	let err = null;
	try {
		ctx.body = await HomeScreenBlogGetCategories(params, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when not login`, async () => {
	ctx.getUserRole = defaultGetUserRole();
	const res = await HomeScreenBlogGetCategoriesRaw();
	expect(res).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user is not cla-admin`, async () => {
	ctx.getUserRole = defaultGetUserRole("teacher");
	const res = await HomeScreenBlogGetCategoriesRaw();
	expect(res).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when home screen category is not found`, async () => {
	mockResult = {
		rows: [
			{
				id: 1,
				blog_category_names: ["www.google.com"],
				_count_: 1,
			},
		],
	};
	ctx.getUserRole = defaultGetUserRole("cla-admin");
	const res = await HomeScreenBlogGetCategoriesRaw();
	expect(res).toEqual(new Error("400 ::: Unknown error"));
});

test(`Returns result`, async () => {
	ctx.getUserRole = defaultGetUserRole("cla-admin");
	expect(await HomeScreenBlogGetCategoriesRaw(params)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ id: 1, blog_category_names: ["www.google.com"], _count_: 0 }] });
});
