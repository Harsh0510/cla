/**
 * Maybe send an email to the user that attempted to unlock the book which are now available on the EP
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `AssetAvailableEmailLog`,
		callback: `AssetAvailableEmailLog`,
		dateToExecute: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //execute once in a week
	});
};
