/**
 * apps/Controller/app/core/admin/async_task/fakeExtractAccessPurger.js
 */
module.exports = (taskPusher) => {
	return taskPusher.pushTask({
		key: `/admin/fakeExtractAccessPurger`,
		callback: `/admin/fakeExtractAccessPurger`,
		dateToExecute: new Date(Date.now() + 5 * 60 * 1000),
	});
};
