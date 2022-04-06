const getSchoolByRegx = require("../../../core/auth/common/getSchoolByRegx");
const context = require("../../common/Context");

let ctx;

/** Mock of getSchoolRecords */
jest.mock("../../../core/auth/common/getSchoolRecords", () => {
	return function () {
		return mockResultGetSchoolrecords;
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockFunction = jest.fn();
	ctx = new context();
	postcodeRegex = {
		exec: () => mockMatchResult,
	};
	query = "barnsley";
	whereClauses = [];
	columns = [
		"school.id AS id",
		"school.name AS name",
		"school.address1 AS address1",
		"school.address2 AS address2",
		"school.city AS city",
		"school.post_code AS post_code",
	];
	caseColumns = [
		", CASE WHEN (school.city IS NULL OR TRIM(school.city) = '') THEN CONCAT(school.name,', ', school.post_code )",
		"WHEN (school.post_code IS NULL OR TRIM(school.post_code) = '') THEN CONCAT(school.name,', ', school.city)",
		"ELSE CONCAT(school.name,', ',school.city,', ', school.post_code)  END AS labelvalue",
	];
	isPartial = false;
	tableJoins = [];
	limit = 25;
	binds = [];
	mockResultGetSchoolrecords = {
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
	};
	mockMatchResult = null;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Returns null if no match found`, async () => {
	const item = await getSchoolByRegx(ctx, postcodeRegex, query, whereClauses, columns, caseColumns, tableJoins, limit, binds);
	expect(item).toBe(null);
});

test(`Returns result Successfully`, async () => {
	mockMatchResult = ["s74", "s74", undefined, "s74", "s74"];
	const item = await getSchoolByRegx(ctx, postcodeRegex, query, whereClauses, columns, caseColumns, tableJoins, limit, binds);
	expect(item).toEqual({
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
	});
});

test(`Returns result Successfully when search with partial post code`, async () => {
	mockMatchResult = ["s74", "s74", undefined, "s74", "s74"];
	isPartial = true;
	query = "";
	const item = await getSchoolByRegx(ctx, postcodeRegex, query, whereClauses, columns, caseColumns, tableJoins, limit, binds, isPartial);
	expect(item).toEqual({
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
	});
});
