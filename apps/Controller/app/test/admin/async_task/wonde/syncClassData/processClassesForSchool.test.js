let mockGetClassesForSchool;
let mockInsertData;
let mockSmartUpsert;
let mockFunction;

jest.mock("../../../../../common/wonde/wonde.js", () => {
	return {
		async getClassesForSchool(...args) {
			return mockGetClassesForSchool(...args);
		},
	};
});

jest.mock("../../../../../common/wait.js", () => {
	return () => {};
});

jest.mock("../../../../../core/admin/async_task/wonde/syncClassData/bindInsertData.js", () => {
	return (...args) => mockInsertData(...args);
});

jest.mock("../../../../../core/admin/async_task/wonde/syncClassData/getFilteredRecords", () => {
	return {
		getExcludedWondeIdentifiers: async () => new Set(),
		getFilteredRecords: (_, records) => records,
	};
});

jest.mock("../../../../../core/admin/async_task/wonde/common/smartUpsert", () => {
	return (mockFunction, data, cb) => {
		cb();
		return mockSmartUpsert(mockFunction, data);
	};
});

const processClassesForSchool = require("../../../../../core/admin/async_task/wonde/syncClassData/processClassesForSchool");

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockGetClassesForSchool = () => {};
	mockInsertData = async () => ({
		query: "",
		binds: [],
	});
	mockSmartUpsert = () => [];
	mockFunction = jest.fn();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("no results", async () => {
	mockGetClassesForSchool = () => {
		return {
			data: [],
			has_more: false,
		};
	};
	let wasCalled = false;
	mockSmartUpsert = () => {
		wasCalled = true;
	};
	await processClassesForSchool(null, "abc", 0);
	expect(wasCalled).toBe(false);
});

test("multiple pages of results", async () => {
	mockGetClassesForSchool = (_, page) => {
		return {
			data: [
				{
					page: page,
					idx: 0,
				},
				{
					page: page,
					idx: 1,
				},
			],
			has_more: page <= 1,
		};
	};
	mockSmartUpsert = (_, data) => {
		return data.map((r) => {
			return { ...r, inserted: r.idx === 1 };
		});
	};
	await processClassesForSchool(null, "abc", 0);
	expect(mockSmartUpsert.length).toBe(2);
});
