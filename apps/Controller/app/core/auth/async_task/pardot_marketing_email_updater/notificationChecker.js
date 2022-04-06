module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `PardotMarketingEmailUpdater`,
		callback: `PardotMarketingEmailUpdater`,
		dateToExecute: new Date(Date.now() + 5 * 60 * 1000),
	});
};
