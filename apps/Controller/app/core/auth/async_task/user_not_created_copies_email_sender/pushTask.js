/**
 * Maybe send email for user who not created the copies after registering
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `UserNotCreateCopiesEmailSender`,
		callback: `UserNotCreateCopiesEmailSender`,
		dateToExecute: new Date(Date.now() + 60 * 60 * 1000), // 1 hour in future,
	});
};
