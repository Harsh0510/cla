const mockCommonRaw = require("../../../common/asyncTaskRunner/common");
let mockclient = null;
let mockSettings = null;
let mockIsRecordInserted = false;
let mockIsRecordDeleted = false;

jest.mock("../../../common/pg", () => {
	return true;
});

function resetAll() {
	mockclient = {
		query: function (query, values) {
			if (query.indexOf("INSERT INTO") !== -1) {
				mockIsRecordInserted = true;
			} else if (query.indexOf("DELETE") !== -1) {
				mockIsRecordDeleted = true;
			}
		},
	};
	mockSettings = {
		key: true,
		jsDateToExecute: false,
		data: {
			id: 5,
		},
	};
	mockIsRecordInserted = false;
	mockIsRecordDeleted = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("call Push Function with true key", () => {
	mockCommonRaw.pushTask(mockSettings, mockclient);
	mockCommonRaw.deleteTask(mockSettings, mockclient);
	expect(mockIsRecordInserted).toEqual(true);
	expect(mockIsRecordDeleted).toEqual(true);
});

test("call Push Function with false key", () => {
	mockSettings.key = false;
	mockCommonRaw.pushTask(mockSettings, mockclient);
	mockCommonRaw.deleteTask(mockSettings, mockclient);
	expect(mockIsRecordInserted).toEqual(true);
	expect(mockIsRecordDeleted).toEqual(true);
});

test("call Push Function with data null", () => {
	delete mockSettings.data;
	mockCommonRaw.pushTask(mockSettings, mockclient);
	mockCommonRaw.deleteTask(mockSettings, mockclient);
	expect(mockIsRecordInserted).toEqual(true);
	expect(mockIsRecordDeleted).toEqual(true);
});

test("call Push Function with data null and key false", () => {
	delete mockSettings.data;
	mockSettings.key = false;
	mockCommonRaw.pushTask(mockSettings, mockclient);
	mockCommonRaw.deleteTask(mockSettings, mockclient);
	expect(mockIsRecordInserted).toEqual(true);
	expect(mockIsRecordDeleted).toEqual(true);
});

test("call Functions with dateExecute is false", () => {
	delete mockSettings.jsDateToExecute;
	mockCommonRaw.pushTask(mockSettings, mockclient);
	mockCommonRaw.deleteTask(mockSettings, mockclient);
	expect(mockIsRecordInserted).toEqual(true);
	expect(mockIsRecordDeleted).toEqual(true);
});
