const asyncTaskRunnerRaw = require("../../../common/asyncTaskRunner/AsyncTaskRunner");
let mockRoutes = null;
let mockIsQueryCommited = false;
let mockIsdeleteSelf = false;
let mockSelectResult = null;
let mockPgPool = null;

jest.mock("../../../common/consoleLog", () => {
	return () => {};
});

jest.mock("../../../common/pg", () => {
	return true;
});

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

jest.mock("../../../common/asyncTaskRunner/AsyncTaskDetails", () => {
	return class AsyncTaskDetails {
		constructor(dbData, client) {
			this._dbData = dbData;
			this._client = client;
		}
		async deleteSelf() {
			mockIsdeleteSelf = true;
			return true;
		}
	};
});

/**
 * Mock for console.log
 */
global.console = { log: jest.fn() };

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, 100);
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockFunction = jest.fn();
	mockRoutes = Object.create(null);
	mockRoutes.TestCallback = async function () {
		return true;
	};
	mockRoutes.TestCallback2 = async function () {
		return true;
	};
	mockIsQueryCommited = false;
	mockIsdeleteSelf = false;
	mockSelectResult = {
		rowCount: 2,
		rows: [
			{
				id: 1,
				callback_name: "TestCallback",
				data: "",
			},
			{
				id: 2,
				callback_name: "TestCallback2",
				data: "",
			},
		],
	};
	mockPgPool = {
		connect: function () {
			return {
				query: async function (query) {
					if (query.indexOf("BEGIN") !== -1) {
						return;
					} else if (query.indexOf("COMMIT") !== -1) {
						mockIsQueryCommited = true;
					} else if (query.indexOf("SELECT") !== -1) {
						if (mockSelectResult) {
							return mockSelectResult;
						}
						throw "unknown error";
					}
				},
				release: function () {
					return true;
				},
			};
		},
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("Query Commited when data found", async () => {
	const asyncTaskDetails = new asyncTaskRunnerRaw(mockPgPool);
	asyncTaskDetails.route("TestCallback", mockRoutes.TestCallback);
	asyncTaskDetails.route("TestCallback2", mockRoutes.TestCallback2);
	asyncTaskDetails.execute();
	await asyncTaskDetails._tickOne();
	const result_delete_task = asyncTaskDetails.deleteTask();
	const result_push_task = asyncTaskDetails.pushTask();
	expect(result_push_task).toEqual(true);
	expect(result_delete_task).toEqual(true);
});

test("Query Commited when data found", async () => {
	const asyncTaskDetails = new asyncTaskRunnerRaw(mockPgPool);
	asyncTaskDetails.route("TestCallback", mockRoutes.TestCallback);
	asyncTaskDetails.route("TestCallback2", mockRoutes.TestCallback2);
	await asyncTaskDetails._tick();
	expect(mockIsQueryCommited).toEqual(false);
});

test("When Should Execute is false", async () => {
	const asyncTaskDetails = new asyncTaskRunnerRaw(mockPgPool);
	asyncTaskDetails.route("TestCallback", mockRoutes.TestCallback);
	asyncTaskDetails.route("TestCallback2", mockRoutes.TestCallback2);
	await asyncTaskDetails.execute();
	await asyncTaskDetails._tick();
	await asyncTaskDetails.stop();
	expect(mockIsQueryCommited).toEqual(false);
});

test("When No records are found", async () => {
	mockResult = [];
	mockRowCount = 0;
	mockSelectResult = {
		rowCount: 0,
		rows: [],
	};
	const asyncTaskDetails = new asyncTaskRunnerRaw(mockPgPool);
	asyncTaskDetails.route("TestCallback", mockRoutes.TestCallback);
	asyncTaskDetails.route("TestCallback2", mockRoutes.TestCallback2);
	await asyncTaskDetails.execute();
	await asyncTaskDetails._tick();
	expect(mockIsQueryCommited).toEqual(false);
});

test("When No records are found", async () => {
	mockRoutes.TestCallback = "Test";
	const asyncTaskDetails = new asyncTaskRunnerRaw(mockPgPool);
	asyncTaskDetails.route("test", "test");
	expect(mockIsQueryCommited).toEqual(false);
});

test("Throw exception when fetching the async_task data", async () => {
	mockSelectResult = null;
	const asyncTaskDetails = new asyncTaskRunnerRaw(mockPgPool);
	asyncTaskDetails.route("test", "test");
	expect(mockIsQueryCommited).toEqual(false);
});

test("Throw exception when async_task function throw an exception", async () => {
	mockRoutes.TestCallback = async function () {
		throw "Unknown error";
	};
	mockRoutes.TestCallback2 = async function () {
		throw "Unknown error";
	};
	const asyncTaskDetails = new asyncTaskRunnerRaw(mockPgPool);
	asyncTaskDetails.route("test", "test");
	expect(mockIsQueryCommited).toEqual(false);
	asyncTaskDetails.route("TestCallback", mockRoutes.TestCallback);
	asyncTaskDetails.route("TestCallback2", mockRoutes.TestCallback2);
	await asyncTaskDetails.execute();
	await asyncTaskDetails._tick();
	expect(mockIsQueryCommited).toEqual(false);
});

test("Throw exception when async_task don't have function type", async () => {
	mockRoutes.TestCallback = "Test";
	mockRoutes.TestCallback2 = async function () {
		throw "Unknown error";
	};
	const asyncTaskDetails = new asyncTaskRunnerRaw(mockPgPool);
	asyncTaskDetails.route("test", "test");
	expect(mockIsQueryCommited).toEqual(false);
	asyncTaskDetails.route("TestCallback", mockRoutes.TestCallback);
	asyncTaskDetails.route("TestCallback2", mockRoutes.TestCallback2);
	await asyncTaskDetails.execute();
	await asyncTaskDetails._tick();
	expect(mockIsQueryCommited).toEqual(false);
});

test("Get async task log when async_task don't have function type", async () => {
	mockRoutes.TestCallback = "test";
	mockRoutes.TestCallback2 = "mockString2";
	const asyncTaskDetails = new asyncTaskRunnerRaw(mockPgPool);
	asyncTaskDetails.route("test", "test");
	expect(mockIsQueryCommited).toEqual(false);
	asyncTaskDetails.route("TestCallback", mockRoutes.TestCallback);
	asyncTaskDetails.route("TestCallback2", mockRoutes.TestCallback2);
	await asyncTaskDetails.execute();
	await asyncTaskDetails._tick();
	expect(mockIsQueryCommited).toEqual(false);
});
