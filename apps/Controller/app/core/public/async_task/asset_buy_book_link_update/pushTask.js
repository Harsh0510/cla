/**
 * May flush the cache for an asset if its cache hasn't been updated in at least a week
 */
module.exports = function (asyncRunner) {
	return asyncRunner.pushTask({
		key: `AssetBuyBookLinkUpdate`,
		callback: `AssetBuyBookLinkUpdate`,
		dateToExecute: new Date(Date.now() + 5 * 60 * 1000), // 5 min in future,
	});
};
