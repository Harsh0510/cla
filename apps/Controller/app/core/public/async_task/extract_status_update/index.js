const pushTask = require("./pushTask");
const { extractStatus } = require("../../../../common/staticValues");
const STATUS_ACTIVE = extractStatus.active;
const STATUS_EDITABLE = extractStatus.editable;

async function updateExtracts(querier) {
	await querier(
		`
			UPDATE
				extract
			SET
				status = $1,
				date_edited = NOW()
			WHERE
				grace_period_end <= NOW()
				AND status = $2
				AND archive_date IS NULL
		`,
		[STATUS_ACTIVE, STATUS_EDITABLE]
	);
}

module.exports = async function (taskDetails) {
	try {
		await updateExtracts(taskDetails.query.bind(taskDetails));
	} finally {
		//delete task from asynctask
		await taskDetails.deleteSelf();
		// Push this task back into the queue so it runs itself in future.
		await pushTask(taskDetails);
	}
};
