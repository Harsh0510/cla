/**
 * apps/Controller/app/core/admin/async_task/fakeExtractAccessPurger.js
 */
module.exports = (taskPusher) => {
	return taskPusher.pushTask({
		key: `/admin/syncWondeUserData`,
		callback: `/admin/syncWondeUserData`,
		dateToExecute: new Date(Date.now() + 5 * 60 * 1000), // every 5 mints
	});
};
