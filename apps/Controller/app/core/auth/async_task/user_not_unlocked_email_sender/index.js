const pushTask = require("./pushTask");
const sendEmailByDays = require("./sendEmailByDays");

/**
 * Exucute the function based on asynctaskRunner
 */
module.exports = async function (taskDetails) {
	//We need to send the 12 day email first, then the 5 day.
	//This will ensure that, when this functionality first goes live, that existing users that haven't unclock a book for more than 12 days only receive a single email - the 12 day one.
	const days = [12, 5];
	try {
		for (const day of days) {
			await sendEmailByDays(taskDetails, day);
		}
	} catch (e) {
		throw e;
	} finally {
		//delete task from asynctask
		await taskDetails.deleteSelf();
		// Push this task back into the queue so it runs itself in about 5 minutes.
		await pushTask(taskDetails);
	}
};
