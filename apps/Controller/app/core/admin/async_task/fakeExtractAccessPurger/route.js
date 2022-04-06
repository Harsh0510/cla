const pushTask = require("./pushTask");

module.exports = async function (taskDetails) {
	await taskDetails.query(`DELETE FROM extract_access WHERE title_of_work = '__DUMMY_TEST_ACCESS__' AND date_created < NOW() - interval '1 hour'`);

	await taskDetails.deleteSelf();

	await pushTask(taskDetails);
};
