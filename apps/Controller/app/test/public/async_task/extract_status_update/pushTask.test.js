const pushTask = require("../../../../core/public/async_task/extract_status_update/pushTask");

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
	pushTaskObj.dateToExecute = new Date(Date.now() + 30 * 60 * 1000);
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`task is pushed or not`, async () => {
	const result = await pushTask(mockAsyncTaskRunner);
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("key");
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("callback");
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("dateToExecute");
	expect(isTaskPushed).toEqual(true);
});
