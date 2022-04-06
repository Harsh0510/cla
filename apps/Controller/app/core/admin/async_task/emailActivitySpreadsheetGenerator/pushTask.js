module.exports = (taskPusher) => {
	const dt = new Date();
	dt.setDate(dt.getDate() + 1);
	dt.setHours(3);
	dt.setMinutes(0);
	dt.setSeconds(0);
	return taskPusher.pushTask({
		key: `/admin/emailActivitySpreadsheetGenerator`,
		callback: `/admin/emailActivitySpreadsheetGenerator`,
		dateToExecute: dt, // 3am every day
	});
};
