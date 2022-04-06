const WONDE_SCHOOL_SYNC_PERIOD = (() => {
	const defaultValue = 24 * 60 * 60 * 1000 - 10000; // once a day (minus 10s)
	if (!process.env.WONDE_SCHOOL_SYNC_PERIOD_HOURS) {
		return defaultValue;
	}
	const hours = parseFloat(process.env.WONDE_SCHOOL_SYNC_PERIOD_HOURS);
	if (hours <= 0) {
		return defaultValue;
	}
	return hours * 60 * 60 * 1000;
})();

module.exports = (taskPusher) => {
	return taskPusher.pushTask({
		key: `/admin/syncWondeSchoolData`,
		callback: `/admin/syncWondeSchoolData`,
		dateToExecute: new Date(Date.now() + WONDE_SCHOOL_SYNC_PERIOD),
	});
};
