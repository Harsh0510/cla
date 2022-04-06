const route = require("../../../../core/admin/async_task/unlockAttemptLogGenerator/route");

let pushTaskObj = Object.create(null);
let isTaskPushed = false;
let isImageUploaded = false;

global.console = { log: jest.fn() };

jest.mock("../../../../core/admin/async_task/unlockAttemptLogGenerator/pushTask", () => {
	return function pushTask(pushTaskObj) {
		isTaskPushed = true;
		return pushTaskObj;
	};
});

jest.mock("../../../../core/admin/azure/azureBlobService", () => {
	return {
		uploadBuffer: (jpgFilePath, getResourceFun, extraData) => {
			isImageUploaded = true;
			return true;
		},
	};
});

const mockAsyncTaskRunner = new (class mockAsyncTaskRunner {
	query() {
		return {
			rows: [
				{
					id: 477,
					name: "St Paul's",
				},
				{
					id: 10528,
					name: "Golspie High School (Golspie)",
				},
			],
		};
	}
	deleteSelf() {
		return true;
	}
})();

/**
 * Reset function - called before each test.
 */
function resetAll() {
	pushTaskObj.key = "Test Key";
	pushTaskObj.callback = "Test CallBack";
	pushTaskObj.dateToExecute = new Date(Date.now() + 60 * 60 * 1000);
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`task is pushed or not`, async () => {
	await route(mockAsyncTaskRunner);
	expect(isTaskPushed).toEqual(true);
	expect(isImageUploaded).toEqual(true);
});
