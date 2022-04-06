const pushTask = require("./pushTask");
const process = require("./process");

module.exports = async function (taskDetails) {
	try {
		await process(taskDetails.query.bind(taskDetails));
	} finally {
		//delete task from asynctask
		await taskDetails.deleteSelf();
		// Push this task back into the queue so it runs itself in about 1 hour.
		await pushTask(taskDetails);
	}
};
