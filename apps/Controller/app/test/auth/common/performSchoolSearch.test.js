const performSchoolSearch = require("../../../core/auth/common/performSchoolSearch");
const context = require("../../common/Context");

let ctx;

/** Mock of getSchoolRecords */
jest.mock("../../../core/auth/common/getSchoolByRegx", () => {
	return function () {
		return mockResultGetSchoolByRegex;
	};
});

jest.mock("../../../core/auth/common/getSchoolRecords", () => {
	return function () {
		return mockResultGetSchoolRecords;
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockFunction = jest.fn();
	ctx = new context();
	mockResultGetSchoolByRegex = {
		result: {
			rowCount: 1,
			rows: [
				{
					id: 23218,
					name: "Barlby Bridge Community Primary School",
					address1: "Thomas Street",
					address2: "Barlby Road",
					city: "Selby",
					post_code: "YO8 5AA",
					labelvalue: "Barlby Bridge Community Primary School Selby , YO8 5AA",
				},
			],
		},
	};
	mockResultGetSchoolRecords = {
		result: {
			rowCount: 1,
			rows: [
				{
					id: 23218,
					name: "Barlby Bridge Community Primary School",
					address1: "Thomas Street",
					address2: "Barlby Road",
					city: "Selby",
					post_code: "YO8 5AA",
					labelvalue: "Barlby Bridge Community Primary School Selby , YO8 5AA",
				},
			],
		},
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/** Common function */
async function performSchoolSearchRaw(data, control) {
	let err = null;
	try {
		ctx.body = await performSchoolSearch(ctx, data, control);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		include_extra_data: true,
		domain: null,
		domainHasChanged: false,
		full_postcode_search: false,
		partial_postcode_search: false,
		query: "s74 0dj",
		limit: 25,
	};
}

test(`Returns result Successfully when user search with full post code`, async () => {
	let rows = mockResultGetSchoolRecords.result.rows;
	let params = getParams();
	params.full_postcode_search = true;
	expect(await performSchoolSearchRaw(params, true)).toBe(null);
	expect(ctx.body).toEqual({
		foundResults: true,
		schoolRecords: {
			result: {
				rowCount: 1,
				rows: rows,
			},
		},
	});
});

test(`Returns result Successfully when user search with partial post code`, async () => {
	let rows = mockResultGetSchoolRecords.result.rows;
	let params = getParams();
	params.partial_postcode_search = true;
	params.query = "s74";
	expect(await performSchoolSearchRaw(params, true)).toBe(null);
	expect(ctx.body).toEqual({
		foundResults: true,
		schoolRecords: {
			result: {
				rowCount: 1,
				rows: rows,
			},
		},
	});
});

test(`Returns result Successfully when user search with school name`, async () => {
	let rows = mockResultGetSchoolRecords.result.rows;
	let params = getParams();
	params.query = "barnsley";
	expect(await performSchoolSearchRaw(params, true)).toBe(null);
	expect(ctx.body).toEqual({
		foundResults: true,
		schoolRecords: {
			result: {
				rowCount: 1,
				rows: rows,
			},
		},
	});
});

test(`Returns result Successfully when user search with school name and post-code`, async () => {
	mockResultGetSchoolByRegex = null;
	let rows = mockResultGetSchoolRecords.result.rows;
	let params = getParams();
	params.query = "barnsley Hs3";
	expect(await performSchoolSearchRaw(params, true)).toBe(null);
	expect(ctx.body).toEqual({
		foundResults: true,
		schoolRecords: {
			result: {
				rowCount: 1,
				rows: rows,
			},
		},
	});
});

test(`Returns result Successfully when user search with school name and post-code`, async () => {
	mockResultGetSchoolByRegex = null;
	let rows = mockResultGetSchoolRecords.result.rows;
	let params = getParams();
	params.query = "barnsley Hs1";
	expect(await performSchoolSearchRaw(params, false)).toBe(null);
	expect(ctx.body).toEqual({
		foundResults: true,
		schoolRecords: {
			result: {
				rowCount: 1,
				rows: rows,
			},
		},
	});
});

test(`Test if no result found when user search with school name and post-code`, async () => {
	mockResultGetSchoolRecords.result.rowCount = 0;
	mockResultGetSchoolRecords.result.rows = [];
	mockResultGetSchoolByRegex = null;
	let params = getParams();
	params.query = "barnsley Hs1";
	expect(await performSchoolSearchRaw(params, false)).toBe(null);
	expect(ctx.body).toEqual({
		foundResults: false,
		schoolRecords: {
			result: {
				rowCount: 0,
				rows: [],
			},
		},
	});
});

test(`Returns result when search with domain`, async () => {
	let rows = mockResultGetSchoolRecords.result.rows;
	let params = getParams();
	params.domain = "cla.com";
	params.include_extra_data = false;
	params.domainHasChanged = true;
	params.query = null;
	expect(await performSchoolSearchRaw(params, true)).toBe(null);
	expect(ctx.body).toEqual({
		foundResults: true,
		schoolRecords: {
			result: {
				rowCount: 1,
				rows: rows,
			},
		},
	});
});
