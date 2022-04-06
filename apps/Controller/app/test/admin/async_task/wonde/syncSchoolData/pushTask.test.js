const OLD_ENV = process.env;
const pushTask = require("../../../../../core/admin/async_task/wonde/syncSchoolData/pushTask");

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
beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	resetAll();
});

afterEach(() => {
	process.env = OLD_ENV; // restore old env
	resetAll();
});

test(`task is pushed or not`, async () => {
	await pushTask(mockAsyncTaskRunner);
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("key");
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("callback");
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("dateToExecute");
	expect(isTaskPushed).toEqual(true);
});

test(`task is pushed or not when passed period hours`, async () => {
	process.env.WONDE_SCHOOL_SYNC_PERIOD_HOURS = 10;
	const pushTask = require("../../../../../core/admin/async_task/wonde/syncSchoolData/pushTask");
	await pushTask(mockAsyncTaskRunner);
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("key");
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("callback");
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("dateToExecute");
	expect(isTaskPushed).toEqual(true);
});

test(`task is pushed or not when passed period hours less then 0`, async () => {
	process.env.WONDE_SCHOOL_SYNC_PERIOD_HOURS = -1;
	const pushTask = require("../../../../../core/admin/async_task/wonde/syncSchoolData/pushTask");
	await pushTask(mockAsyncTaskRunner);
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("key");
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("callback");
	expect(await pushTask(mockAsyncTaskRunner)).toHaveProperty("dateToExecute");
	expect(isTaskPushed).toEqual(true);
});
