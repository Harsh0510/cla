/**
 * Maybe send email for user who not verified the email address
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `UserNotVerifiedEmailSender`,
		callback: `UserNotVerifiedEmailSender`,
		dateToExecute: new Date(Date.now() + 60 * 60 * 1000), // 1 hour in future,
	});
};
