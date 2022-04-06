/**
 * Maybe send 'too many extract access' email to CLA admins
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `ExtractAccessSendEmailChecker`,
		callback: `ExtractAccessSendEmailChecker`,
		dateToExecute: new Date(Date.now() + 5 * 60 * 1000), // 5 mins in future,
	});
};
