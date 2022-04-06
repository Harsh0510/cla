const assetUserUploadGetAllRaw = require("../../core/public/asset-user-upload-get-all");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		sort_field: "content_title",
		sort_direction: "A",
		limit: 10,
		offset: 0,
		query: "test",
		mine_only: 0,
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

async function assetUserUploadGetAll(data) {
	let err = null;
	try {
		ctx.body = await assetUserUploadGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

//Error when user role is cla-admin
test(`Error when user role is cla-admin`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
});

//Error when limit is invalid
test(`Error when limit is invalid`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	data.limit = "test";
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Limit invalid"));
});

//Error when limit is negative
test(`Error when limit is negative`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	data.limit = -40;
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Limit must be positive"));
});

//Error when limit is 0
test(`Error when limit is 0`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	data.limit = 0;
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Limit must be positive"));
});

//Error when offset is invalid
test(`Error when offset is invalid`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	data.offset = "test";
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Offset invalid"));
});

//Error when offset is negative
test(`Error when offset is negative`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	data.offset = -40;
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Offset must not be negative"));
});

//Error when sort_direction not pass
test(`Error when sort_direction not pass`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	delete data.sort_direction;
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Sort Direction not provided"));
});

//Error when sort_direction is positive integer number
test(`Error when sort_direction is positive integer number`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	data.sort_direction = 1;
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Sort Direction invalid"));
});

//Error when sort_direction is invalid
test(`Error when sort_direction is invalid`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	data.sort_direction = "test";
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Invalid sort direction"));
});

//Error when sort_field not pass
test(`Error when sort_field not pass`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	delete data.sort_field;
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

//Error when sort_field is invalid
test(`Error when sort_field is invalid`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	data.sort_field = "test";
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

//Error when query is invalid
test(`Error when query is invalid`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	data.query = 123;
	expect(await assetUserUploadGetAll(data)).toEqual(new Error("400 ::: Query invalid"));
});

//Success while executing the result query
test(`Success while executing the result query`, async () => {
	ctx.sessionData.user_role = "teacher";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 1 }] };
		} else if (query.indexOf("SELECT asset_user_upload.id AS id, asset_user_upload.oid AS oid,") === 0) {
			return {
				rows: [],
			};
		}
	};
	const data = getValidRequest();
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 1 });
});

//Success when not pass the query/limit/offset
test(`Success when not pass the query/limit/offset`, async () => {
	ctx.sessionData.user_role = "teacher";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("SELECT asset_user_upload.id AS id, asset_user_upload.oid AS oid,") === 0) {
			return {
				rows: [],
			};
		}
	};
	const data = getValidRequest();
	delete data.query;
	delete data.limit;
	delete data.offset;
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 5 });
});

//Success when valid sort_direction as 'D'
test(`Success when sort direct as desc`, async () => {
	ctx.sessionData.user_role = "teacher";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("SELECT asset_user_upload.id AS id, asset_user_upload.oid AS oid,") === 0) {
			return { rows: [] };
		}
	};
	const data = getValidRequest();
	delete data.query;
	delete data.limit;
	delete data.offset;
	data.sort_direction = "D";
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 5 });
});

test(`Success when user search for only his/her uploded asset`, async () => {
	ctx.sessionData.user_role = "teacher";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 5 }] };
		} else if (query.indexOf("SELECT asset_user_upload.id AS id, asset_user_upload.oid AS oid,") === 0) {
			return { rows: [] };
		}
	};
	const data = getValidRequest();
	data.mine_only = 1;
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({ data: [], unfiltered_count: 5 });
});

test(`Success when asset found`, async () => {
	ctx.sessionData.user_role = "teacher";
	ctx.doAppQuery = (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT COUNT(*) AS _count_ ") === 0) {
			return { rows: [{ _count_: 1 }] };
		} else if (query.indexOf("SELECT asset_user_upload.id AS id, asset_user_upload.oid AS oid,") === 0) {
			return {
				rows: [
					{
						asset_id: 25911,
						authors: [{ role: "A", lastName: "Johnson", firstName: "Lake" }],
						content_title: "Another title goes here",
						copy_count: 1,
						copy_ratio: 0.033,
						date_created: "2022-03-07T05:35:45.323Z",
						filename: "9789350485842_4b73fcf1b2daf099ee4a0fa58bee7391c23a.pdf",
						first_name: "school",
						id: 88,
						isbn13: "9789350485842",
						last_name: "admin",
						oid: "4b73fcf1b2daf099ee4a0fa58bee7391c23a",
						pages: [1, 2, 3, 4, 5],
						upload_name: "test abc",
					},
				],
			};
		}
	};
	const data = getValidRequest();
	expect(await assetUserUploadGetAll(data)).toBeNull();
	expect(ctx.body).toMatchObject({
		data: [
			{
				asset_id: 25911,
				authors: [{ role: "A", lastName: "Johnson", firstName: "Lake" }],
				content_title: "Another title goes here",
				copy_count: 1,
				copy_ratio: 0.033,
				date_created: "2022-03-07T05:35:45.323Z",
				filename: "9789350485842_4b73fcf1b2daf099ee4a0fa58bee7391c23a.pdf",
				first_name: "school",
				id: 88,
				isbn13: "9789350485842",
				last_name: "admin",
				oid: "4b73fcf1b2daf099ee4a0fa58bee7391c23a",
				pages: [1, 2, 3, 4, 5],
				pdf_url: "https://occcladevstorage.blob.core.windows.net/public/Dickens_Carol.pdf",
				upload_name: "test abc",
			},
		],
		unfiltered_count: 1,
	});
});
