const pushTask = require("./pushTask");
const processClassesForSchool = require("./processClassesForSchool");

module.exports = async function (taskDetails) {
	try {
		//fetch school
		const data = await taskDetails.query(
			`
				SELECT
					id,
					wonde_identifier
				FROM
					school
				WHERE
					wonde_identifier IS NOT NULL
					AND (
						date_last_wonde_class_synced IS NULL
						OR date_last_wonde_class_synced < NOW() - INTERVAL '1 day'
					)
					AND enable_wonde_class_sync = TRUE
					AND wonde_approved = TRUE
				ORDER BY
					school.date_last_wonde_class_synced ASC NULLS FIRST
				LIMIT
					10
			`
		);

		if (!data.rows.length) {
			return;
		}

		const querier = taskDetails.query.bind(taskDetails);

		for (const schoolRecord of data.rows) {
			try {
				await processClassesForSchool(querier, schoolRecord.wonde_identifier, schoolRecord.id);
			} catch (e) {
				console.error("error processing Wonde classes for school " + schoolRecord.id, e.message, e.stack);
			}
		}

		//Update date_last_wonde_class_synced for fetched schools
		await taskDetails.query(
			`UPDATE school SET date_last_wonde_class_synced = NOW(), date_edited = NOW() WHERE id IN (${data.rows.map((r) => r.id).join(", ")})`
		);
	} finally {
		await taskDetails.deleteSelf();
		await pushTask(taskDetails);
	}
};
