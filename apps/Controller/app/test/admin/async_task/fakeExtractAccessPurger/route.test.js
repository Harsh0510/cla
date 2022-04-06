const route = require("../../../../core/admin/async_task/fakeExtractAccessPurger/route");

let pushTaskObj = Object.create(null);
let isTaskPushed = false;

jest.mock("../../../../core/admin/async_task/fakeExtractAccessPurger/pushTask", () => {
	return function pushTask(pushTaskObj) {
		isTaskPushed = true;
		return pushTaskObj;
	};
});

const mockAsyncTaskRunner = new (class mockAsyncTaskRunner {
	query() {
		return true;
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
});
