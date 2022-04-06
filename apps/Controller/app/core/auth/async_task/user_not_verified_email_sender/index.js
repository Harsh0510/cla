const pushTask = require("./pushTask");
const sendEmailByHours = require("./sendEmailByHours");
const constants = require("./constants");

/**
 * Exucute the function based on asynctaskRunner
 */
module.exports = async function (taskDetails) {
	//Hours based on desc day (2 week+ 71 hours, 1 weeks+ 71 hous, 71 hours)
	const hours = constants.hours;
	try {
		//add try block with finnalyy
		for (const hour of hours) {
			await sendEmailByHours(taskDetails, hour);
		}
	} finally {
		//delete task from asynctask
		await taskDetails.deleteSelf();
		// Push this task back into the queue so it runs itself in about 5 minutes.
		await pushTask(taskDetails);
	}
};
