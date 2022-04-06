/**
 * apps/Controller/app/core/admin/async_task/unlockAttemptLogGenerator
 */
module.exports = (taskPusher) => {
	return taskPusher.pushTask({
		key: `/admin/unlockAttemptLogGenerator`,
		callback: `/admin/unlockAttemptLogGenerator`,
		dateToExecute: new Date(Date.now() + 1 * 60 * 60 * 1000), // every hour
	});
};
