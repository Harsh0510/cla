const assetUserUploadGetAllRaw = require("../../core/admin/asset-user-upload-get-all");
const Context = require("../common/Context");

let ctx;
let mockUserSessionData;
let mockResult;

function getValidRequest() {
	return {
		sort_field: "institution",
		sort_direction: "A",
		limit: 10,
		offset: 0,
		query: "test",
	};
}
async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`asset_user_upload.id AS id,`) !== -1) {
		return { rows: [mockResult.data] };
	}
	if (query.indexOf(`COUNT (*) AS _count_`) !== -1) {
		return { rows: [mockResult.count] };
	}
	return;
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();

	mockUserSessionData = {
		user_role: "cla-admin",
		user_id: 185692,
		school_id: 153,
	};
	ctx = new Context();
	ctx.getSessionData = async (_) => {
		return mockUserSessionData;
	};

	ctx.getUserRole = async (_) => {
		return mockUserSessionData.user_role;
	};

	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};
	mockResult = {
		data: { id: 1, filename: "test url" },
		count: { _count_: 1 },
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function assetUserUploadGetAll(data) {
	let err = null;
	try {
		ctx.body = await assetUserUploadGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("When user is not logged in", async () => {
	const data = getValidRequest();
	mockUserSessionData = null;
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("When user is not a cla-admin", async () => {
	const data = getValidRequest();
	mockUserSessionData.user_role = "school-admin";
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("Success", async () => {
	const data = getValidRequest();
	expect(await assetUserUploadGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test("Success when limit is not passed", async () => {
	const data = getValidRequest();
	delete data.limit;
	expect(await assetUserUploadGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test("Success when offset is not passed", async () => {
	const data = getValidRequest();
	delete data.offset;
	expect(await assetUserUploadGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test("Success when sort direction is descending", async () => {
	const data = getValidRequest();
	data.sort_direction = "desc";
	expect(await assetUserUploadGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test("Error when invalid sort field passed", async () => {
	const data = getValidRequest();
	data.sort_field = "test";
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
	expect(ctx.body).toBeNull();
});

test("Success when valid sort field passed", async () => {
	const data = getValidRequest();
	data.sort_field = "user_name";
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test("Error when invalid sort direction passed", async () => {
	const data = getValidRequest();
	data.sort_direction = "test";
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Invalid sort direction"));
	expect(ctx.body).toBeNull();
});

test("When no result found", async () => {
	const data = getValidRequest();
	mockResult.count = { _count_: 0 };
	expect(await assetUserUploadGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({ data: [], unfiltered_count: 0 });
});

test(`Success when user pass query params null`, async () => {
	const data = getValidRequest();
	data.query = null;
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test(`Error when user pass wrong query params`, async () => {
	const data = getValidRequest();
	data.query = 123;
	expect(await assetUserUploadGetAll(data, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Success when user pass query params string`, async () => {
	const data = getValidRequest();
	data.query = "School";
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test(`Success when user pass query params string and No result founds`, async () => {
	const data = getValidRequest();
	data.query = "School";
	mockResult.data = [];
	mockResult.count = 0;
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: [],
		unfiltered_count: 0,
	});
});

test(`Error when user pass invalid filter`, async () => {
	const data = getValidRequest();
	data.query = "School";
	data.filter = [];
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));

	data.filter = "ABC";
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass invalid institution in filter`, async () => {
	const data = getValidRequest();
	data.query = "School";
	data.filter = {
		institutions: ["a", "b", "c"],
	};
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Institution id invalid"));
	expect(ctx.body).toBeNull();
});

test(`Success when user pass valid institution in filter`, async () => {
	const data = getValidRequest();
	data.query = "School";
	data.filter = {
		institutions: [1],
	};
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test(`Error when user pass invalid flag in filter`, async () => {
	const data = getValidRequest();
	data.query = "School";
	data.filter = {
		flags: ["test"],
	};
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Flag not found"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass greater than 3 filters`, async () => {
	const data = getValidRequest();
	data.query = "School";
	data.filter = {
		flags: ["test"],
		institutions: ["a", "b", "c"],
		test: [],
		extra: "test filter",
	};
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Too many filters provided"));
	expect(ctx.body).toBeNull();
});

test(`Succes when user pass chapter flag`, async () => {
	const data = getValidRequest();
	data.query = "School";
	data.filter = {
		flags: ["chapter"],
	};
	expect(await assetUserUploadGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test(`Succes when user pass over 5% flag`, async () => {
	const data = getValidRequest();
	data.query = "School";
	data.filter = {
		flags: ["over_5"],
	};
	expect(await assetUserUploadGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});

test(`Succes when user pass incorrect pdf page count flag`, async () => {
	const data = getValidRequest();
	data.query = "School";
	data.filter = {
		flags: ["incorrect_pdf_page_count"],
	};
	expect(await assetUserUploadGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({ data: [mockResult.data], unfiltered_count: 1 });
});
