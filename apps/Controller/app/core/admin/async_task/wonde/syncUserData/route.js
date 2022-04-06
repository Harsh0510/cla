const pushTask = require("./pushTask");
const processUsersForSchool = require("./processUsersForSchool");

module.exports = async function (taskDetails) {
	const pool = taskDetails.getAppDbPool();
	const querier = pool.query.bind(pool);
	try {
		//fetch schools
		const data = await querier(
			`
				SELECT
					id,
					wonde_identifier,
					name
				FROM
					school
				WHERE
					wonde_identifier IS NOT NULL
					AND (
						date_last_wonde_user_synced IS NULL
						OR date_last_wonde_user_synced < NOW() - INTERVAL '1 day'
					)
					AND enable_wonde_user_sync = TRUE
					AND wonde_approved = TRUE
				ORDER BY
					date_last_wonde_user_synced ASC NULLS FIRST
				LIMIT
					3
			`
		);

		if (!data.rows.length) {
			return;
		}

		for (const localSchoolRecord of data.rows) {
			try {
				await processUsersForSchool(querier, localSchoolRecord.wonde_identifier, localSchoolRecord.id, localSchoolRecord.name);
			} catch (e) {
				console.error("error processing Wonde users for school " + localSchoolRecord.id, e.message, e.stack);
			}
		}
		//Update date_last_wonde_user_synced for fetched schools
		await querier(
			`UPDATE school SET date_last_wonde_user_synced = NOW(), date_edited = NOW() WHERE id IN (${data.rows.map((r) => r.id).join(", ")})`
		);
	} finally {
		await taskDetails.deleteSelf();
		await pushTask(taskDetails);
	}
};
