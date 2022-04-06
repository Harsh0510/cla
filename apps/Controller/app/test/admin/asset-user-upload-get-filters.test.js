const assetUserUploadGetFiltersRaw = require("../../core/admin/asset-user-upload-get-filters");
const Context = require("../common/Context");

let ctx;
let mockSchoolResult;

async function appDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`FROM school`) !== -1) {
		return mockSchoolResult;
	}
	return;
}

function resetAll() {
	ctx = new Context();

	mockUserSessionData = {
		user_role: "cla-admin",
		user_id: 185692,
		school_id: 153,
	};

	ctx.getSessionData = async (_) => {
		return mockUserSessionData;
	};

	ctx.getUserRole = async (_) => {
		return mockUserSessionData.user_role;
	};

	ctx.appDbQuery = async function (query, values) {
		return await appDbQuery(query, values);
	};

	mockSchoolResult = {
		rows: [
			{ id: 1, name: "test school1" },
			{ id: 2, name: "test school2" },
		],
		rowCount: 2,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function assetUserUploadGetFilters(data) {
	let err = null;
	try {
		ctx.body = await assetUserUploadGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("When user is not logged in", async () => {
	mockUserSessionData = null;
	expect(await assetUserUploadGetFilters()).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("When user is not a cla-admin", async () => {
	mockUserSessionData.user_role = "school-admin";
	expect(await assetUserUploadGetFilters()).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("Success when institutions is passed in params", async () => {
	const data = { filter_institutions: [1, 2, 3] };
	expect(await assetUserUploadGetFilters(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: [
			{
				data: [
					{ id: "chapter", title: "Chapter" },
					{ id: "over_5", title: "Over 5%" },
					{ id: "incorrect_pdf_page_count", title: "Incorrect PDF page count" },
				],
				id: "flags",
				title: "Flags",
			},
			{
				data: [
					{ id: 1, name: "test school1" },
					{ id: 2, name: "test school2" },
				],
				id: "institutions",
				title: "institutions",
			},
		],
	});
});

test("Success when institutions is not passed in params", async () => {
	const data = { filter_institutions: undefined };
	expect(await assetUserUploadGetFilters(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: [
			{
				data: [
					{ id: "chapter", title: "Chapter" },
					{ id: "over_5", title: "Over 5%" },
					{ id: "incorrect_pdf_page_count", title: "Incorrect PDF page count" },
				],
				id: "flags",
				title: "Flags",
			},
			{
				data: [],
				id: "institutions",
				title: "institutions",
			},
		],
	});
});
