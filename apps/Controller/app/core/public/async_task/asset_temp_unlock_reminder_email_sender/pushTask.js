/**
 * Maybe send an email reminder to the user that temporarily unlocked the book when the temporary unlock has 7 days until it expires
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `assetTempUnlockReminderEmailSender`,
		callback: `assetTempUnlockReminderEmailSender`,
		dateToExecute: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hour in future
	});
};
