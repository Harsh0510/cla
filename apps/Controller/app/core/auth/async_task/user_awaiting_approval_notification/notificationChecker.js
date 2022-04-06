/**
 * Maybe add 'too many user awaiting approval notification' for school admins
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `UserAwaitingApprovalNotification`,
		callback: `UserAwaitingApprovalNotification`,
		dateToExecute: new Date(Date.now() + 15 * 60 * 1000), // 15 mins in future,
	});
};
