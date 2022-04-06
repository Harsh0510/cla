module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `PardotAdder`,
		callback: `PardotAdder`,
		dateToExecute: new Date(Date.now() + 5 * 60 * 1000),
	});
};
