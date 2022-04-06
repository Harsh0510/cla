const pushTask = require("./pushTask");
const sendEmailByDays = require("./sendEmailByDays");

/**
 * Exucute the function based on asynctaskRunner
 * send an email reminder to the user that temporarily unlocked the book when the temporary unlock has 7 days until it expires.
 */
module.exports = async function (taskDetails) {
	const days = 7;
	try {
		await sendEmailByDays(taskDetails, days);
	} finally {
		//delete task from asynctask
		await taskDetails.deleteSelf();
		// Push this task back into the queue so it runs itself in about 4 hours.
		await pushTask(taskDetails);
	}
};
