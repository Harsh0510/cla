const homeScreenBlogCategoryUpdate = require("../../core/admin/home-screen-blog-category-update");

let ctx, mockResult, mockGetBlogCategoryRecord;

function defaultAppDbQuery(query, values) {
	query = query.trim();
	return new Promise((resolve, reject) => {
		if (query.indexOf("SELECT") !== -1) {
			resolve(mockGetBlogCategoryRecord);
		} else if (query.indexOf("UPDATE") !== -1) {
			resolve(mockResult);
		}
	});
}

function defaultGetUserRoleFunctor(role) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(role);
		});
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
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
		getAppDbPool: (_) => ({
			connect: function () {
				return {
					query: async function (query) {
						if (query.indexOf("UPDATE") !== -1) {
							return mockResult;
						}
					},
					release: function () {
						return true;
					},
				};
			},
		}),
		responseStatus: 200,
		body: null,
		appDbQuery: defaultAppDbQuery,
		getUserRole: defaultGetUserRoleFunctor("cla-admin"),
	};
	mockGetBlogCategoryRecord = {
		rows: [{ id: 1, blog_category_names: [], _count_: 0 }],
	};
	mockResult = {
		rowCount: 1,
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function homeScreenBlogCategoryUpdateRaw(data) {
	let err = null;
	try {
		ctx.body = await homeScreenBlogCategoryUpdate(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		blog_category_names: ["www.google.com", "google.com"],
	};
}

test(`Error when user is not a cla admin`, async () => {
	ctx.getUserRole = defaultGetUserRoleFunctor("teacher");
	let params = getParams();
	expect(await homeScreenBlogCategoryUpdateRaw(params)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Got message when no fields will be changed`, async () => {
	ctx.getUserRole = defaultGetUserRoleFunctor("cla-admin");
	let params = getParams();
	params.blog_category_names = undefined;
	expect(await homeScreenBlogCategoryUpdateRaw(params)).toEqual(new Error("400 ::: No fields changed"));
});

test(`Got message when blog category names is not passed as an array`, async () => {
	ctx.getUserRole = defaultGetUserRoleFunctor("cla-admin");
	let params = getParams();
	params.blog_category_names = "www.google.com";
	expect(await homeScreenBlogCategoryUpdateRaw(params)).toEqual(new Error("400 ::: News Feed Category must be an array"));
});

test(`Update data when request is well formed`, async () => {
	ctx.getUserRole = defaultGetUserRoleFunctor("cla-admin");
	let params = getParams();
	expect(await homeScreenBlogCategoryUpdateRaw(params)).toBeNull();
	expect(ctx.body).toEqual({
		result: true,
	});
});

test(`Error when blog category names are not passed`, async () => {
	ctx.getUserRole = defaultGetUserRoleFunctor("cla-admin");
	const params = {
		blog_category_name: [],
	};
	expect(await homeScreenBlogCategoryUpdateRaw(params)).toEqual(new Error("400 ::: No fields changed"));
});

test(`Error when  home screen category not found`, async () => {
	ctx.getUserRole = defaultGetUserRoleFunctor("cla-admin");
	mockGetBlogCategoryRecord = {
		rows: [{ id: 1, blog_category_names: [], _count_: 1 }],
	};
	let params = getParams();
	expect(await homeScreenBlogCategoryUpdateRaw(params)).toEqual("Can not find the home screen category row.");
});

test(`Error when home screen category not found`, async () => {
	ctx.getUserRole = defaultGetUserRoleFunctor("cla-admin");
	let params = getParams();
	params.blog_category_names = [""];
	expect(await homeScreenBlogCategoryUpdateRaw(params)).toBeNull();
});

test(`Test when it throws an exception`, async () => {
	(ctx.getAppDbPool = (_) => ({
		connect: function () {
			return {
				query: async function (query) {
					if (query.indexOf("ROLLBACK") !== -1) {
						return;
					} else {
						return new Promise((resolve, reject) => {
							reject("Unknown Error");
						});
					}
				},
				release: function () {
					return true;
				},
			};
		},
	})),
		(ctx.getUserRole = defaultGetUserRoleFunctor("cla-admin"));
	let params = getParams();
	expect(await homeScreenBlogCategoryUpdateRaw(params)).toEqual(new Error("400 ::: Unknown Error"));
});

test(`Test when thrown an exception is not a string`, async () => {
	(ctx.getAppDbPool = (_) => ({
		connect: function () {
			return {
				query: async function (query) {
					if (query.indexOf("ROLLBACK") !== -1) {
						return;
					} else {
						return new Promise((resolve, reject) => {
							reject([]);
						});
					}
				},
				release: function () {
					return true;
				},
			};
		},
	})),
		(ctx.getUserRole = defaultGetUserRoleFunctor("cla-admin"));
	let params = getParams();
	expect(await homeScreenBlogCategoryUpdateRaw(params)).toEqual(new Error("400 ::: Unknown Error [1]"));
});
