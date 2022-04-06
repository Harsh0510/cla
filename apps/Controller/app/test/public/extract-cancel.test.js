const extractCancelRaw = require("../../core/public/extract-cancel");
const context = require("../common/Context");

let ctx, params;
let mockGetExtractPagesForSchool;
let mockGetExtractPagesForCourse;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

let MockExtractData = [
	{
		oid: "60b6ae2e2111611f03332044d6b14c73bd4a",
		asset_id: 19226,
		course_id: 31914,
		school_id: 365518,
		id: 16,
	},
];

jest.mock(`../../common/getExtractPagesForSchool`, () => {
	return function () {
		return mockGetExtractPagesForSchool;
	};
});

jest.mock(`../../common/getExtractPagesForCourse`, () => {
	return function () {
		return mockGetExtractPagesForCourse;
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

function getParamsData() {
	return params;
}

function resetAll() {
	ctx = new context();
	params = {
		oid: "60b6ae2e2111611f03332044d6b14c73bd4a",
	};
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("UPDATE extract") !== -1) {
			return {
				rows: MockExtractData,
				rowCount: 1,
			};
		}
	};
	mockGetExtractPagesForSchool = [1, 2, 3];
	mockGetExtractPagesForCourse = [1, 2, 3];
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function extractCancel(data) {
	let err = null;
	try {
		ctx.body = await extractCancelRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("Error when not logged in", async () => {
	const params = getParamsData();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => reject(new Error("failed")));
	expect(await extractCancel(params)).toEqual(new Error("failed"));
});

test("Success when cla-admin try to cancel the extract", async () => {
	const params = getParamsData();
	expect(await extractCancel(params)).toEqual(null);
});

test("Error when user don't send a oid in params", async () => {
	let params = getParamsData();
	expect(await extractCancel(params)).toBe(null);
});

test("Error when extract with that oid is not present", async () => {
	const params = getParamsData();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("UPDATE extract") !== -1) {
			return {
				rowCount: 0,
			};
		}
	};
	expect(await extractCancel(params)).toEqual(new Error("400 ::: extract not found"));
});

test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
	const params = getParamsData();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("UPDATE extract") !== -1) {
			mockIsIncludeModifyUserId = trimQuery.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = trimQuery.indexOf("date_edited") !== -1 ? true : false;
			return {
				rows: MockExtractData,
				rowCount: 1,
			};
		}
	};
	expect(await extractCancel(params)).toEqual(null);
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});

test("Success when school-admin try to cancel the extract", async () => {
	ctx.sessionData.user_role = "school-admin";
	const params = getParamsData();
	expect(await extractCancel(params)).toEqual(null);
});
