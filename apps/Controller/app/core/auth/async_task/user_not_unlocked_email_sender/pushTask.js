/**
 * Maybe send email for user who did not set password
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `UserNotUnlockedEmailSender`,
		callback: `UserNotUnlockedEmailSender`,
		dateToExecute: new Date(Date.now() + 60 * 60 * 1000), // 1 hour in future,
	});
};
