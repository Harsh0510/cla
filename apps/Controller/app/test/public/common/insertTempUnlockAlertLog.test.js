const insertTempUnlockAlertLogRaw = require("../../../core/public/common/insertTempUnlockAlertLog");
let mockIsInsertQueryCalled = false;
let mockData;
let querier = {
	query: async (psqlQuery) => {
		if (psqlQuery.indexOf("INSERT") != -1) {
			mockIsInsertQueryCalled = true;
			return true;
		}
		return false;
	},
};
/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockIsInsertQueryCalled = false;
	mockData = {
		schoolName: "Test School",
		schoolId: 1,
		userId: 15,
		numberOfTempUnlocked: 3,
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function insertTempUnlockAlertLog(schoolName, schoolId, userId, numberOfTempUnlocked) {
	let err = null;
	try {
		result = await insertTempUnlockAlertLogRaw(querier, schoolName, schoolId, userId, numberOfTempUnlocked);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	mockIsInsertQueryCalled = false;
	expect(await insertTempUnlockAlertLog(mockData.schoolName, mockData.schoolId, mockData.userId, mockData.numberOfTempUnlocked)).toEqual(null);
	expect(mockIsInsertQueryCalled).toEqual(true);
});
