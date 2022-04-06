const extractReactivateRaw = require("../../core/public/extract-reactivate");
const Context = require("../common/Context");
let ctx, mockExtracts, mockExtractPagesforSchool, mockExtractPagesforCourse, mockGetExtractLimitPercentage;
let mockIsIncludeModifyUserIdForExtract;
let mockIsIncludeDateEditedForExtract;
let mockIsIncludeModifyUserIdForExtractShare;
let mockIsIncludeDateEditedForExtractShare;
let mockIsIncludeModifyUserIdForCourse;
let mockIsIncludeDateEditedForCourse;

jest.mock("../../core/public/common/getExtractLimitPercentage.js", () => {
	return function () {
		return mockGetExtractLimitPercentage;
	};
});

function getExtractData(query, values) {
	if (query.indexOf("CONCAT (extract.course_id, '_', extract.asset_id) AS course_asset_identity")) {
		return {
			rows: mockExtracts,
		};
	} else if (query.indexOf("extract_page_by_school")) {
		return {
			rows: mockExtractPagesforSchool,
		};
	} else if (query.indexOf("CONCAT (course_id, '_', asset_id) IN (SELECT DISTINCT CONCAT (course_id, '_', asset_id)")) {
		return {
			rows: mockExtractPagesforCourse,
		};
	} else if (query.indexOf("UPDATE")) {
		return {
			rows: [],
		};
	} else {
		throw new Error("should never get here");
	}
}

function resetAll() {
	ctx = new Context();
	mockGetExtractLimitPercentage = { class: 0.05, school: 0.2 };
	mockExtracts = [
		{
			extract_id: 1,
			oid: "a".repeat(32),
			pdf_isbn13: "2054-6149-2019-10-73",
			course_id: 100,
			asset_id: 1,
			pages: [1, 2],
			title: "test",
			asset_expiration_date: "2019-05-18 09:27:40.906363",
			asset_copyable_page_count: 100,
			course_asset_identity: "1_123",
			course_oid: "2f3b94f41bcd6761b685e6ae40db6c27223f",
		},
		{
			extract_id: 2,
			oid: "b".repeat(32),
			pdf_isbn13: "2054-6149-2019-10-73",
			course_id: 100,
			asset_id: 2,
			pages: [1, 2],
			title: "test",
			asset_expiration_date: "2019-05-18 09:27:40.906363",
			asset_copyable_page_count: 100,
			course_asset_identity: "1_123",
			course_oid: "2f3b94f41bcd6761b685e6ae40db6c27223d",
		},
	];
	mockExtractPagesforSchool = [
		{
			asset_id: 1,
			page_number: 1,
		},
		{
			asset_id: 1,
			page_number: 2,
		},
		{
			asset_id: 1,
			page_number: 2,
		},
	];
	mockExtractPagesforCourse = [
		{
			course_asset_identity: "100_1",
			page_number: 1,
		},
	];
	ctx.appDbQuery = (query, values) => getExtractData(query, values);
	ctx.query = (query, values) => getExtractData(query, values);
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.academic_year_end = [9, 20];
	mockIsIncludeModifyUserIdForExtract = false;
	mockIsIncludeDateEditedForExtract = false;
	mockIsIncludeModifyUserIdForExtractShare = false;
	mockIsIncludeDateEditedForExtractShare = false;
	mockIsIncludeModifyUserIdForCourse = false;
	mockIsIncludeDateEditedForCourse = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function extractReactivate(data) {
	let err = null;
	try {
		ctx.body = await extractReactivateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		filter: {
			class: [1, 2, 3],
		},
		oids: ["a".repeat(32)],
		has_selected_all_copies: false,
		query: "test",
	};
}

test("No has_select_all_copies field is provided", async () => {
	const params = getParams();
	delete params.has_selected_all_copies;
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: has_selected_all_copies should be a boolean"));
});

test("Error when has_select_all_copies field is not a boolean", async () => {
	const params = getParams();
	delete params.has_selected_all_copies;
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: has_selected_all_copies should be a boolean"));
});

test("Error when oids is not provided", async () => {
	const params = getParams();
	delete params.oids;
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: oids should be an array"));
});

test("Error when type of oids is not an array", async () => {
	const params = getParams();
	params.oids = Object.create(null);
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: oids should be an array"));
});

test("Error when invalid user role", async () => {
	ctx.sessionData.user_role = "superadmin";
	const params = getParams();
	params.oids = [];
	params.has_selected_all_copies = true;
	expect(await extractReactivate(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test("Error when user does not send select_all_copies_field as well as oids", async () => {
	const params = getParams();
	params.oids = [];
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: Select at-least one copy from the list"));
});

test("Error when select_all_copies_field is false as well no id's in oids", async () => {
	const params = getParams();
	params.oids = [];
	params.has_selected_all_copies = false;
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: Select at-least one copy from the list"));
});

test("Error when user sends a filter but type of a filter is not an object", async () => {
	const params = getParams();
	params.filter = "Filter";
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: Invalid filter provided"));
});

test("Error when user sends a filter but type of a filter is an array", async () => {
	const params = getParams();
	params.filter = [];
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: Invalid filter provided"));
});

test("Error when class of filter is not an array", async () => {
	const params = getParams();
	params.filter = {
		class: Object.create(null),
	};
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: Invalid class provided"));
});

test("Error when more then one filter is provided by user", async () => {
	const params = getParams();
	params.filter["q"] = "test";
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: Too many filters provided"));
});

test("User select some records without filter", async () => {
	const params = getParams();
	delete params["filter"];
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [],
		reactivateCount: 2,
	});
});

test("User select some records when user doesnot send the class inside a filter", async () => {
	const params = getParams();
	delete params["filter"]["class"];
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [],
		reactivateCount: 2,
	});
});

test("No Error when user doesnot send the class array is empty", async () => {
	const params = getParams();
	params["filter"]["class"] = [];
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [],
		reactivateCount: 2,
	});
});

test("Error when one of class id is negative", async () => {
	const params = getParams();
	params.filter.class = [-1, 1];
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: Class id must be positive"));
});

test("Error when type of query is not a string", async () => {
	const params = getParams();
	params.query = Object.create(null);
	expect(await extractReactivate(params, ctx)).toEqual(new Error("400 ::: Query invalid"));
});

test("User select records when query field is missing", async () => {
	const params = getParams();
	delete params.query;
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [],
		reactivateCount: 2,
	});
});

test("When we don't get a data from extract", async () => {
	const params = getParams();
	mockExtracts = [];
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [],
		reactivateCount: 0,
	});
});

test("User selected all records", async () => {
	const params = getParams();
	params.oids = [];
	params.has_selected_all_copies = true;
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [],
		reactivateCount: 2,
	});
});

test("User selected all records and dis select some extract", async () => {
	const params = getParams();
	params.has_selected_all_copies = true;
	params.oid = ["a".repeat(32)];
	mockExtracts = [
		{
			extract_id: 2,
			oid: "b".repeat(32),
			pdf_isbn13: "2054-6149-2019-10-73",
			course_id: 100,
			asset_id: 2,
			pages: [1, 2],
			title: "test",
			asset_expiration_date: "2019-05-18 09:27:40.906363",
			asset_copyable_page_count: 100,
			course_asset_identity: "1_123",
			course_oid: "2f3b94f41bcd6761b685e6ae40db6c27223f",
		},
	];
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [],
		reactivateCount: 1,
	});
});

test("User selected all records and getting the course limit exceed for some copy", async () => {
	const params = getParams();
	params.has_selected_all_copies = true;
	mockExtracts = [
		{
			extract_id: 2,
			oid: "b".repeat(32),
			pdf_isbn13: "2054-6149-2019-10-73",
			course_id: 100,
			asset_id: 2,
			pages: [1, 2, 3, 4, 5, 6, 7],
			title: "test",
			asset_expiration_date: "2019-05-18 09:27:40.906363",
			asset_copyable_page_count: 100,
			course_asset_identity: "1_123",
			course_oid: "2f3b94f41bcd6761b685e6ae40db6c27223f",
		},
	];
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [
			{
				copyTitle: "test",
				course_oid: "2f3b94f41bcd6761b685e6ae40db6c27223f",
				exceededFor: "course",
				oid: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
				pages: [1, 2, 3, 4, 5, 6, 7],
				pdf_isbn13: "2054-6149-2019-10-73",
			},
		],
		reactivateCount: 0,
	});
});

test("User selected all records and getting the school limit exceed for some copy", async () => {
	const params = getParams();
	params.has_selected_all_copies = true;
	mockGetExtractLimitPercentage = { class: 0.05, school: 0.03 };
	mockExtracts = [
		{
			extract_id: 2,
			oid: "b".repeat(32),
			pdf_isbn13: "2054-6149-2019-10-73",
			course_id: 100,
			asset_id: 2,
			pages: [1, 2, 3, 4],
			title: "test",
			asset_expiration_date: "2019-05-18 09:27:40.906363",
			asset_copyable_page_count: 100,
			course_asset_identity: "1_123",
			course_oid: "2f3b94f41bcd6761b685e6ae40db6c27223f",
		},
	];
	mockExtractPagesforSchool = [
		{
			asset_id: 2,
			page_number: 1,
		},
		{
			asset_id: 2,
			page_number: 2,
		},
		{
			asset_id: 2,
			page_number: 2,
		},
	];
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [
			{
				copyTitle: "test",
				course_oid: "2f3b94f41bcd6761b685e6ae40db6c27223f",
				exceededFor: "school",
				oid: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
				pages: [1, 2, 3, 4],
				pdf_isbn13: "2054-6149-2019-10-73",
			},
		],
		reactivateCount: 0,
	});
});

test("User reactivate extract after rollover process", async () => {
	const params = getParams();
	ctx.query = (query, data) => {
		if (query.indexOf("extract_page_by_school")) {
			return {
				rows: [],
			};
		} else if (query.indexOf("CONCAT (course_id, '_', asset_id) IN (SELECT DISTINCT CONCAT (course_id, '_', asset_id)")) {
			return {
				rows: [],
			};
		} else {
			return getExtractData(query, data);
		}
	};
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [],
		reactivateCount: 2,
	});
});

test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
	const params = getParams();
	ctx.appDbQuery = (query, data) => {
		query = query.trim().replace(/[\s\t\n\r]+/g, " ");
		if (query.indexOf("UPDATE extract SET") !== -1) {
			mockIsIncludeModifyUserIdForExtract = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedForExtract = query.indexOf("date_edited") !== -1 ? true : false;
		}
		if (query.indexOf("UPDATE extract_share SET") !== -1) {
			mockIsIncludeModifyUserIdForExtractShare = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedForExtractShare = query.indexOf("date_edited") !== -1 ? true : false;
		}
		if (query.indexOf("UPDATE course SET") !== -1) {
			mockIsIncludeModifyUserIdForCourse = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedForCourse = query.indexOf("date_edited") !== -1 ? true : false;
		}
		return getExtractData(query, data);
	};
	expect(await extractReactivate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({
		erroredExtract: [],
		reactivateCount: 2,
	});
	expect(mockIsIncludeModifyUserIdForExtract).toBe(true);
	expect(mockIsIncludeDateEditedForExtract).toBe(true);
	expect(mockIsIncludeModifyUserIdForExtractShare).toBe(true);
	expect(mockIsIncludeDateEditedForExtractShare).toBe(true);
	expect(mockIsIncludeModifyUserIdForCourse).toBe(true);
	expect(mockIsIncludeDateEditedForCourse).toBe(true);
});
