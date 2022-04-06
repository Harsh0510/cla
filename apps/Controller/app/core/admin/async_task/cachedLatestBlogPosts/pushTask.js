/**
 * apps/Controller/app/core/admin/async_task/cachedLatestBlogPosts
 */
module.exports = (taskPusher) => {
	return taskPusher.pushTask({
		key: `/admin/cachedLatestBlogPosts`,
		callback: `/admin/cachedLatestBlogPosts`,
		dateToExecute: new Date(Date.now() + 1 * 60 * 60 * 1000), // every hour
	});
};
