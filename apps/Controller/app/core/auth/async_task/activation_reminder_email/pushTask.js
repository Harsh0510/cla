/**
 * Maybe send email for user who not set their password
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `ActivationEmailReminder`,
		callback: `ActivationEmailReminder`,
		dateToExecute: new Date(Date.now() + 60 * 60 * 1000), // 1 hour in future,
	});
};
