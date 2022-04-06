const asyncTaskDetailsRaw = require("../../../common/asyncTaskRunner/AsyncTaskDetails");
let mockDbData = null;
let mockClientData = null;

jest.mock("../../../common/asyncTaskRunner/common", () => {
	let pushTask = function () {
		return true;
	};
	let deleteTask = function () {
		return true;
	};

	return {
		pushTask: pushTask,
		deleteTask: deleteTask,
	};
});

jest.mock("../../../common/pg", () => {
	let Client = class {
		constructor(connectionString, statement_timeout) {
			this.connectionString = connectionString;
			this.statement_timeout = statement_timeout;
		}
	};

	return {
		Client: Client,
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockDbData = {
		id: 5,
		data: true,
	};
	mockClientData = {
		query: function () {
			return true;
		},
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("test methods", () => {
	const asyncTaskDetails = new asyncTaskDetailsRaw(mockDbData, mockClientData);
	expect(asyncTaskDetails.getDbId()).toEqual(mockDbData.id);
	expect(asyncTaskDetails.pushTask()).toEqual(true);
	expect(asyncTaskDetails.getTaskData()).toEqual(true);
	expect(asyncTaskDetails.deleteSelf()).toEqual(true);
	expect(asyncTaskDetails.query()).toEqual(true);
	expect(asyncTaskDetails.appDbQuery()).toEqual(true);
});
