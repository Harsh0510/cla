const blogApi = require("../../../../common/blogApi");
const pushTask = require("./pushTask");

module.exports = async function (taskDetails) {
	try {
		await blogApi.blogUpsert(taskDetails.query.bind(taskDetails));
	} finally {
		await taskDetails.deleteSelf();
		await pushTask(taskDetails);
	}
};
