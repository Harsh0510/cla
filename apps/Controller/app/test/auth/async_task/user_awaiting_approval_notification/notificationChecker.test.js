const notificationChecker = require("../../../../core/auth/async_task/user_awaiting_approval_notification/notificationChecker");

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
	pushTaskObj.dateToExecute = new Date(Date.now() + 0.5 * 60 * 1000);
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`task is pushed or not`, async () => {
	const result = await notificationChecker(mockAsyncTaskRunner);
	expect(await notificationChecker(mockAsyncTaskRunner)).toHaveProperty("key");
	expect(await notificationChecker(mockAsyncTaskRunner)).toHaveProperty("callback");
	expect(await notificationChecker(mockAsyncTaskRunner)).toHaveProperty("dateToExecute");
	expect(isTaskPushed).toEqual(true);
});
