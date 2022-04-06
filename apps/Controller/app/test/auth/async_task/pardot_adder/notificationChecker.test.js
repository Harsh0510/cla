const notificationChecker = require("../../../../core/auth/async_task/pardot_adder/notificationChecker");

let pushTaskObj = Object.create(null);
let isTaskPushed = false;

const mockAsyncTaskRunner = new (class mockAsyncTaskRunner {
	pushTask(pushTaskObj) {
		isTaskPushed = true;
		return pushTaskObj;
	}
})();

/**
 * Reset function - called before each test.
 */
function resetAll() {
	isTaskPushed = false;
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
	await notificationChecker(mockAsyncTaskRunner);
	expect(await notificationChecker(mockAsyncTaskRunner)).toHaveProperty("key");
	expect(await notificationChecker(mockAsyncTaskRunner)).toHaveProperty("callback");
	expect(await notificationChecker(mockAsyncTaskRunner)).toHaveProperty("dateToExecute");
	expect(isTaskPushed).toEqual(true);
});
