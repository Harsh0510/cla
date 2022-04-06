let mockGetRevokedSchoolIds;

jest.mock("../../../../../common/wonde/wonde.js", () => {
	return {
		async getRevokedSchoolIds(...args) {
			return mockGetRevokedSchoolIds(...args);
		},
	};
});

jest.mock("../../../../../common/consoleLog.js", () => {
	return () => {};
});

jest.mock("../../../../../common/wait.js", () => {
	return () => {};
});

const updateRevokedSchools = require("../../../../../core/admin/async_task/wonde/syncSchoolData/updateRevokedSchools");

let querier;
let mockQuery;
let mockIsIncludeDateEdited;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockQuery = () => ({
		rows: [],
		rowCount: 0,
	});
	mockGetRevokedSchoolIds = async () => ({
		data: [],
		has_more: false,
	});
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
	mockIsIncludeDateEdited = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("no results", async () => {
	mockGetRevokedSchoolIds = async () => ({
		data: [],
		has_more: false,
	});
	mockQuery = async () => {
		throw new Error("Should not be here.");
	};
	const res = await updateRevokedSchools(querier);
	expect(res).toBeUndefined();
});

test("multiple pages of results", async () => {
	mockGetRevokedSchoolIds = async (_, page) => {
		if (page <= 1) {
			return {
				has_more: true,
				data: [5, 6, 9, 10],
			};
		}
		return {
			has_more: false,
			data: [20, 30, 40],
		};
	};
	const params = [];
	mockQuery = async (query, binds) => {
		params.push([query, binds]);
	};
	const res = await updateRevokedSchools(querier);
	expect(res).toBeUndefined();
	expect(params.length).toBe(2);
	expect(params[0][0]).toBe(
		`
		UPDATE
			school
		SET
			wonde_approved = FALSE,
			date_edited = NOW()
		WHERE
			school.wonde_identifier IN ($1, $2, $3, $4)
	`
			.trim()
			.replace(/\s+/g, " ")
	);
	expect(params[0][1]).toEqual([5, 6, 9, 10]);
	expect(params[1][0]).toBe(
		`
		UPDATE
			school
		SET
			wonde_approved = FALSE,
			date_edited = NOW()
		WHERE
			school.wonde_identifier IN ($1, $2, $3)
	`
			.trim()
			.replace(/\s+/g, " ")
	);
	expect(params[1][1]).toEqual([20, 30, 40]);
});

test("Ensure date_edited updated successfully in database", async () => {
	mockGetRevokedSchoolIds = async (_, page) => {
		if (page <= 1) {
			return {
				has_more: false,
				data: [5, 6, 9, 10],
			};
		}
	};
	const params = [];
	mockQuery = async (query, binds) => {
		params.push([query, binds]);
		if (query.indexOf(`UPDATE school SET`) !== -1) {
			mockIsIncludeDateEdited = query.indexOf(`date_edited`) !== -1 ? true : false;
		}
	};
	const res = await updateRevokedSchools(querier);
	expect(res).toBeUndefined();
	expect(params.length).toBe(1);
	expect(params[0][0]).toBe(
		`
			UPDATE
				school
			SET
				wonde_approved = FALSE,
				date_edited = NOW()
			WHERE
				school.wonde_identifier IN ($1, $2, $3, $4)
		`
			.trim()
			.replace(/\s+/g, " ")
	);
	expect(params[0][1]).toEqual([5, 6, 9, 10]);
	expect(mockIsIncludeDateEdited).toBe(true);
});
