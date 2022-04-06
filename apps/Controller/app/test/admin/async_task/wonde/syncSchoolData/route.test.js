let mockUpdateApprovedSchools = jest.fn();
let mockUpdateRevokedSchools = jest.fn();
let mockUpdateSchools = jest.fn();
let mockWondeSyncLog = {
	syncFor: {
		school: "school",
	},
	async fetchLastExecutedDate() {},
	async addSyncLog() {},
};
let mockResultFetchEnvSettings = null;
let mockResult;
jest.mock("../../../../../core/admin/async_task/wonde/syncSchoolData/updateSchools.js", () => (...args) => mockUpdateSchools(...args));
jest.mock("../../../../../core/admin/async_task/wonde/syncSchoolData/updateApprovedSchools.js", () => (...args) =>
	mockUpdateApprovedSchools(...args)
);
jest.mock("../../../../../core/admin/async_task/wonde/syncSchoolData/updateRevokedSchools.js", () => (...args) => mockUpdateRevokedSchools(...args));
jest.mock("../../../../../core/admin/async_task/wonde/syncSchoolData/updateRevokedSchools.js", () => (...args) => mockUpdateRevokedSchools(...args));
jest.mock("../../../../../common/wondeSyncLog.js", () => {
	return mockWondeSyncLog;
});

jest.mock("../../../../../common/consoleLog.js", () => {
	return (...args) => {
		console.log("HI", ...args);
	};
});

jest.mock("../../../../../core/admin/async_task/wonde/syncSchoolData/pushTask", () => {
	return () => {};
});
jest.mock("../../../../../common/fetchEnvSettings", () => {
	return async (query) => {
		return mockResultFetchEnvSettings;
	};
});

const syncWondeSchoolDataRaw = require("../../../../../core/admin/async_task/wonde/syncSchoolData/route");

let mockTaskDetail;
let mockQuery;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockUpdateApprovedSchools = jest.fn();
	mockUpdateRevokedSchools = jest.fn();
	mockUpdateSchools = jest.fn();
	mockResultFetchEnvSettings = { wonde_school_sync__fetch_all_schools: false };
	mockQuery = () => ({
		rows: [],
		rowCount: 0,
	});
	const doQuery = (t, v) => {
		let text;
		let values;
		if (typeof t === "string") {
			text = t;
			values = v || [];
		} else {
			text = t.text;
			values = t.values;
		}
		text = text.replace(/\s+/g, " ");
		return mockQuery(text, values);
	};
	mockTaskDetail = {
		getAppDbPool() {
			return {
				query(t, v) {
					return doQuery(t, v);
				},
			};
		},
		async query(t, v) {
			return doQuery(t, v);
		},
		async deleteSelf() {
			mockIsTaskDeleted = true;
		},
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("runs when getting false from fetchEnvSettings", async () => {
	await syncWondeSchoolDataRaw(mockTaskDetail);
	expect(mockUpdateApprovedSchools).toHaveBeenCalled();
	expect(mockUpdateRevokedSchools).toHaveBeenCalled();
	expect(mockUpdateSchools).toHaveBeenCalled();
});

test("runs when getting true from fetchEnvSettings", async () => {
	mockResultFetchEnvSettings = { wonde_school_sync__fetch_all_schools: true };
	await syncWondeSchoolDataRaw(mockTaskDetail);
	expect(mockUpdateApprovedSchools).toHaveBeenCalled();
	expect(mockUpdateRevokedSchools).toHaveBeenCalled();
	expect(mockUpdateSchools).toHaveBeenCalled();
});

test("runs when getting null from fetchEnvSettings", async () => {
	mockResultFetchEnvSettings = null;
	await syncWondeSchoolDataRaw(mockTaskDetail);
	expect(mockUpdateApprovedSchools).toHaveBeenCalled();
	expect(mockUpdateRevokedSchools).toHaveBeenCalled();
	expect(mockUpdateSchools).toHaveBeenCalled();
});
