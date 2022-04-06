const pushTask = require("./pushTask");

const actions = require("./actions");

module.exports = async function (taskDetails) {
	try {
		const result = await taskDetails.query(`
			SELECT
				id,
				status,
				target_execution_date
			FROM
				rollover_job
			WHERE
				active = TRUE
				AND next_execution_date IS NOT NULL
				AND next_execution_date < NOW()
		`);
		if (!result.rowCount) {
			return;
		}
		const querier = taskDetails.query.bind(taskDetails);
		for (const rolloverJob of result.rows) {
			const action = actions[rolloverJob.status];
			if (!action) {
				continue;
			}
			await action(querier, rolloverJob.id, rolloverJob.target_execution_date);
		}
	} finally {
		await taskDetails.deleteSelf();
		await pushTask(taskDetails);
	}
};
