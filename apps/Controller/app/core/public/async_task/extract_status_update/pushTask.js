/**
 * Maybe update user extract which have extract status as editable and date_create + 12 days <= NOW()
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `ExractStatusUpdate`,
		callback: `ExractStatusUpdate`,
		dateToExecute: new Date(Date.now() + 30 * 60 * 1000), // 30 mins in future,
	});
};
