module.exports = (taskPusher) => {
	const nextTime = new Date();
	nextTime.setDate(nextTime.getDate() + 1);
	nextTime.setHours(3);
	nextTime.setMinutes(47);
	nextTime.setSeconds(0);
	nextTime.setMilliseconds(0);
	return taskPusher.pushTask({
		key: `/admin/hwbSchoolSync`,
		callback: `/admin/hwbSchoolSync`,
		dateToExecute: nextTime, // every day at 3.47am
	});
};
