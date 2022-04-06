/**
 * Notification status for search filters
 */
module.exports = function () {
	const notificationStatus = [
		{
			id: 1,
			name: "Read",
			value: 1,
		},
		{
			id: 2,
			name: "Unread",
			value: 0,
		},
	];
	return notificationStatus;
};
