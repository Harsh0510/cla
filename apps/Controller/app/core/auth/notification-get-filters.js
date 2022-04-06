const notificationStatus = require("../../common/getNotificationStatus");
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const result = [];
	try {
		let acceptedNotificationStatus = notificationStatus();
		result.push({
			id: "status",
			title: "Read/Unread",
			data: acceptedNotificationStatus.map((row) => ({ id: row.id, title: row.name, value: row.value })),
		});
		return {
			result: result,
		};
	} catch (e) {
		ctx.throw("500", "An unexpected error has occurred");
	}
};
