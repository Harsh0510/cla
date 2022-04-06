const syncFor = {
	school: "school",
	user: "user",
	class: "class",
};

/**
 * Fetch last executed date based on sync Type
 * @param {*} taskDetails
 * @param {*} type
 */
async function fetchLastExecutedDate(taskDetails, type) {
	const lastSyncLogData = await taskDetails.query(
		`
			SELECT 
				(date_executed - interval '3 days') AS execute_date 
			FROM
				wonde_sync_log
			WHERE
				type = $1
		`,
		[type]
	);
	if (!(lastSyncLogData.rowCount && lastSyncLogData.rows[0].execute_date)) {
		return null;
	}
	return new Date(lastSyncLogData.rows[0].execute_date);
}

/**
 * addSyncLog for update last executed date in wonde_sync_log table
 * @param {*} taskDetails
 * @param {*} type
 */
async function addSyncLog(taskDetails, type) {
	await taskDetails.query(
		`
		INSERT INTO
			wonde_sync_log
			(type, date_executed)
		VALUES 
			($1, NOW())
		ON CONFLICT
			(type)
		DO UPDATE SET
			date_executed = EXCLUDED.date_executed
	`,
		[type]
	);
}

module.exports = {
	syncFor,
	fetchLastExecutedDate,
	addSyncLog,
};
