module.exports = (asyncRunner) =>
	asyncRunner.pushTask({
		key: `MaxmindDbUpdater`,
		callback: `MaxmindDbUpdater`,
		dateToExecute: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // every 7 days,
	});
