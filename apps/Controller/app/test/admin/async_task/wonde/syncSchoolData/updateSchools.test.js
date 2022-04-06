let mockGetLatestSchools;
let mockSmartUpsert;
let mockOpts;
let mockIsIncludeDateEdited;

jest.mock("../../../../../common/wonde/wonde.js", () => {
	return {
		async getLatestSchools(...args) {
			return mockGetLatestSchools(...args);
		},
	};
});

jest.mock("../../../../../common/consoleLog.js", () => {
	return () => {};
});

jest.mock("../../../../../common/wait.js", () => {
	return () => {};
});

jest.mock("../../../../../core/admin/async_task/wonde/syncSchoolData/getFilteredRecords", () => {
	return {
		getExcludedWondeIdentifiers: async () => new Set(),
		getFilteredRecords: (_, schools) => schools,
	};
});

jest.mock("../../../../../core/admin/async_task/wonde/common/smartUpsert", () => {
	return (...args) => {
		mockSmartUpsert.push([...args]);
	};
});

const updateSchools = require("../../../../../core/admin/async_task/wonde/syncSchoolData/updateSchools");

let querier;
let mockQuery;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockQuery = () => ({
		rows: [],
		rowCount: 0,
	});
	mockGetLatestSchools = async () => ({
		data: [],
		has_more: false,
	});
	mockSmartUpsert = [];
	querier = async (t, v) => {
		let text;
		let values;
		if (typeof t === "string") {
			text = t;
			values = v || [];
		} else {
			text = t.text;
			values = t.values;
		}
		text = text.trim().replace(/\s+/g, " ");
		return mockQuery(text, values);
	};
	mockOpts = {};
	mockIsIncludeDateEdited = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("no results", async () => {
	mockGetLatestSchools = async () => ({
		data: [],
		has_more: false,
	});
	mockQuery = async () => {
		throw new Error("Should not be here.");
	};
	const res = await updateSchools(querier, null);
	expect(res).toBeUndefined();
});

test("multiple pages of results", async () => {
	mockGetLatestSchools = async (_, page) => {
		if (page <= 1) {
			return {
				has_more: true,
				data: [
					{
						name: "a1",
						urn: "b",
						id: "c",
						la_code: null,
						mis: null,
						address_postcode: "x",
						address_line_1: "y",
						address_line_2: null,
						address_town: "z",
						school_level: "primary",
					},
					{
						name: "a2",
						urn: "b2",
						id: "c2",
						la_code: null,
						mis: null,
						address_postcode: "x",
						address_line_1: "y",
						address_line_2: null,
						address_town: "z",
						school_level: "primary",
					},
				],
			};
		}
		return {
			has_more: false,
			data: [
				{
					name: "a3",
					urn: "b3",
					id: "c3",
					la_code: null,
					mis: null,
					address_postcode: "x",
					address_line_1: "y",
					address_line_2: null,
					address_town: "z",
					school_level: "primary",
				},
			],
		};
	};
	const params = [];
	mockQuery = async (query, binds) => {
		params.push([query, binds]);
	};
	const res = await updateSchools(querier, null);
	expect(res).toBeUndefined();
	expect(params.length).toBe(2);
	expect(params[0][0]).toBe(
		`
		WITH school_first AS (
			SELECT
				id,
				row_number() OVER (PARTITION BY dfe ORDER BY id ASC) AS row_number
			FROM
				school
		)
		UPDATE
			school
		SET
			wonde_identifier = v.wonde_identifier,
			date_edited = NOW()
		FROM
			(VALUES ($1::text, $2::text), ($3::text, $4::text))
				AS v(wonde_identifier, dfe),
			school_first AS sf
		WHERE
			school.dfe = v.dfe
			AND school.wonde_identifier IS NULL
			AND school.dfe IS NOT NULL
			AND school.id = sf.id
			AND sf.row_number = 1
			AND v.wonde_identifier NOT IN (SELECT wonde_identifier FROM school WHERE wonde_identifier IS NOT NULL)
	`
			.trim()
			.replace(/\s+/g, " ")
	);
	expect(params[0][1]).toEqual(["c", "b", "c2", "b2"]);
	expect(params[1][0]).toBe(
		`
		WITH school_first AS (
			SELECT
				id,
				row_number() OVER (PARTITION BY dfe ORDER BY id ASC) AS row_number
			FROM
				school
		)
		UPDATE
			school
		SET
			wonde_identifier = v.wonde_identifier,
			date_edited = NOW()
		FROM
			(VALUES ($1::text, $2::text))
				AS v(wonde_identifier, dfe),
			school_first AS sf
		WHERE
			school.dfe = v.dfe
			AND school.wonde_identifier IS NULL
			AND school.dfe IS NOT NULL
			AND school.id = sf.id
			AND sf.row_number = 1
			AND v.wonde_identifier NOT IN (SELECT wonde_identifier FROM school WHERE wonde_identifier IS NOT NULL)
	`
			.trim()
			.replace(/\s+/g, " ")
	);
	expect(params[1][1]).toEqual(["c3", "b3"]);
});

test("some schools with no urn", async () => {
	mockGetLatestSchools = async (_, page) => {
		return {
			has_more: false,
			data: [
				{
					name: "a1",
					urn: null,
					id: "c",
					la_code: null,
					mis: null,
					address_postcode: "x",
					address_line_1: "y",
					address_line_2: null,
					address_town: "z",
					school_level: "primary",
				},
				{
					name: "a2",
					urn: "b2",
					id: "c2",
					la_code: null,
					mis: null,
					address_postcode: "x",
					address_line_1: "y",
					address_line_2: null,
					address_town: "z",
					school_level: "primary",
				},
			],
		};
	};
	const params = [];
	mockQuery = async (query, binds) => {
		params.push([query, binds]);
	};
	const res = await updateSchools(querier, null);
	expect(res).toBeUndefined();
	expect(params.length).toBe(1);
	expect(params[0][1]).toEqual(["c2", "b2"]);
});

test("no values to insert", async () => {
	mockGetLatestSchools = async (_, page) => {
		return {
			has_more: false,
			// both schools with no urn
			data: [
				{
					name: "a1",
					urn: null, // no urn
					id: "c",
					la_code: null,
					mis: null,
					address_postcode: "x",
					address_line_1: "y",
					address_line_2: null,
					address_town: "z",
					school_level: "primary",
				},
				{
					name: "a2",
					urn: null, // no urn
					id: "c2",
					la_code: null,
					mis: null,
					address_postcode: "x",
					address_line_1: "y",
					address_line_2: null,
					address_town: "z",
					school_level: "primary",
				},
			],
		};
	};
	mockOpts = {
		page_range: [1, 250],
	};
	const params = [];
	mockQuery = async (query, binds) => {
		params.push([query, binds]);
	};
	const res = await updateSchools(querier, null, mockOpts);
	expect(res).toBeUndefined();
	expect(params.length).toBe(0);
});

test("Ensure date_edited updated successfully in database", async () => {
	mockGetLatestSchools = async (_, page) => {
		return {
			has_more: false,
			data: [
				{
					name: "a1",
					urn: "b",
					id: "c",
					la_code: null,
					mis: null,
					address_postcode: "x",
					address_line_1: "y",
					address_line_2: null,
					address_town: "z",
					school_level: "primary",
				},
				{
					name: "a2",
					urn: "b2",
					id: "c2",
					la_code: null,
					mis: null,
					address_postcode: "x",
					address_line_1: "y",
					address_line_2: null,
					address_town: "z",
					school_level: "primary",
				},
			],
		};
	};
	const params = [];
	mockQuery = async (query, binds) => {
		params.push([query, binds]);
		if (query.indexOf(`UPDATE school SET`) !== -1) {
			mockIsIncludeDateEdited = query.indexOf(`date_edited`) !== -1 ? true : false;
		}
	};
	const res = await updateSchools(querier, null);
	expect(res).toBeUndefined();
	expect(params.length).toBe(1);
	expect(params[0][1]).toEqual(["c", "b", "c2", "b2"]);
	expect(mockIsIncludeDateEdited).toBe(true);
});
