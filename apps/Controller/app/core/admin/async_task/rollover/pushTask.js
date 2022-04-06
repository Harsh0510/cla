const interval = require("./interval");

module.exports = (taskPusher) => {
	return taskPusher.pushTask({
		key: `/admin/rollover`,
		callback: `/admin/rollover`,
		dateToExecute: new Date(Date.now() + interval),
	});
};
