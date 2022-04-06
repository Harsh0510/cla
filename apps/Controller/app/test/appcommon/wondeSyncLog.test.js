const wondeSyncLog = require("../../common/wondeSyncLog");
const syncFor = wondeSyncLog.syncFor;
const fetchLastExecutedDate = wondeSyncLog.fetchLastExecutedDate;
const addSyncLog = wondeSyncLog.addSyncLog;

let mockTaskDetails,
	mockType,
	mockResultQueryGetExecuteDate,
	mockIsInsertQueryExecuted = false;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockResultQueryGetExecuteDate = {
		rowCount: 1,
		rows: [
			{
				execute_date: new Date("2020-10-01 18:49:52.638882+00"),
			},
		],
	};
	mockTaskDetails = {
		query: async (queryText, bindData) => {
			const queryString = queryText.replace(/\s+/g, " ");
			if (queryString.indexOf("SELECT (date_executed") !== -1) {
				return mockResultQueryGetExecuteDate;
			} else if (queryString.indexOf(`INSERT INTO`) !== -1) {
				mockIsInsertQueryExecuted = true;
				return;
			}
		},
	};
	mockType = "school";
	mockIsInsertQueryExecuted = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Getting the chool sync type`, async () => {
	const values = syncFor;
	expect(values).not.toEqual(null);
	expect(values.school).toEqual("school");
	expect(values.user).toEqual("user");
	expect(values.class).toEqual("class");
});

test(`fetchLastExecutedDate function render correctly`, async () => {
	const result = await fetchLastExecutedDate(mockTaskDetails, mockType);
	expect(typeof result).toEqual("object");
	expect(result).toEqual(new Date("2020-10-01 18:49:52.638882+00"));
});

test(`fetchLastExecutedDate function return result as null`, async () => {
	mockResultQueryGetExecuteDate = {
		rowCount: 0,
		rows: [],
	};
	const result = await fetchLastExecutedDate(mockTaskDetails, mockType);
	expect(result).toEqual(null);
});

test(`addSyncLog function reder correctly`, async () => {
	const result = await addSyncLog(mockTaskDetails, mockType);
	expect(mockIsInsertQueryExecuted).toEqual(true);
	expect(result).toEqual(undefined);
});
