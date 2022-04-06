const assetUserUploadDeleteRaw = require("../../core/admin/asset-user-upload-delete");
const Context = require("../common/Context");

let ctx;
let mockUserSessionData;
let mockResult;
let mockExtractResult;
jest.mock(`../../common/getExtractPagesForCourse`, () => {
	return function () {
		return [1, 2, 3, 4, 5];
	};
});

jest.mock(`../../common/getExtractPagesForCourse`, () => {
	return function () {
		return [1, 2, 3, 4, 5];
	};
});

jest.mock(`../../common/updateExtractSchoolPage`, () => {
	return function () {
		return true;
	};
});

jest.mock(`../../common/updateExtractCoursePage`, () => {
	return function () {
		return true;
	};
});

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`DELETE FROM asset_user_upload`) !== -1) {
		return mockResult;
	}
	if (query.indexOf(`DELETE FROM extract WHERE asset_user_upload_id`) !== -1) {
		return mockExtractResult;
	}
	if (query.indexOf(`DELETE FROM extract_note WHERE extract_id`) !== -1) {
		return true;
	}
	if (query.indexOf(`DELETE FROM extract_highlight WHERE extract_id`) !== -1) {
		return true;
	}
	if (query.indexOf(`SELECT pages, school_id, course_id FROM extract WHERE course_id`) !== -1) {
		return {
			rowCount: 1,
			rows: [
				{
					pages: [1, 2, 3, 4, 5],
				},
			],
		};
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
	mockResult = { rowCount: 1 };
	mockExtractResult = { rows: [{ school_id: 123, user_id: 2, id: 3, course_id: 45, asset_id: 1256 }], rowCount: 1 };
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function assetUserUploadDelete(data) {
	let err = null;
	try {
		ctx.body = await assetUserUploadDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("Error when user is not logged in", async () => {
	mockUserSessionData = null;
	const data = { id: 1 };
	expect(await assetUserUploadDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test("Error when user not a cla-admin", async () => {
	mockUserSessionData.user_role = "teacher";
	const data = { id: 1 };
	expect(await assetUserUploadDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test("Success", async () => {
	const data = { id: 1 };
	expect(await assetUserUploadDelete(data)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test("When no record is deleted", async () => {
	const data = { id: 1 };
	mockResult.rowCount = 0;
	expect(await assetUserUploadDelete(data)).toEqual(null);
	expect(ctx.body).toEqual({ result: false });
});

test("When no record is deleted", async () => {
	const data = { id: 1 };
	mockExtractResult.rowCount = 0;
	expect(await assetUserUploadDelete(data)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});
