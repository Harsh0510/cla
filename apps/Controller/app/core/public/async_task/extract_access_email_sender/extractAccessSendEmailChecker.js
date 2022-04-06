const pushExtractAccessSendEmailCheckerTask = require("./pushExtractAccessSendEmailCheckerTask");
const extract_access_email_sender = require(`./extract_access_email_sender`);

module.exports = async function (taskDetails) {
	// What's the most recently extract_access database ID that we've checked and sent emails for?
	// This may be 0 if this is the first time this task is run.
	let lastCompletedId = 0;
	{
		const result = await taskDetails.query(`SELECT last_completed_id FROM extract_access_email_send_log WHERE id = 1 LIMIT 1`);
		if (result.rowCount > 0) {
			lastCompletedId = result.rows[0].last_completed_id;
		}
	}

	// What is the current highest extract_access database ID?
	// This may also be 0 if no extracts have been accessed yet.
	let nextId = 0;
	{
		const result = await taskDetails.query(`SELECT id FROM extract_access ORDER BY id DESC LIMIT 1`);
		if (result.rowCount > 0) {
			nextId = result.rows[0].id;
		}
	}

	if (nextId > lastCompletedId) {
		// Only bother proceeding if the two IDs are different - otherwise there have been no extract views since the last run.
		const result = await taskDetails.query(`
			SELECT
				extract_access.id AS extract_access_id,
				extract_access.extract_id AS extract_id,
				extract_access.extract_share_oid AS extract_share_oid,
				extract_access.asset_id AS asset_id,
				asset.isbn13 AS isbn13,
				extract_access.title_of_work AS asset_name,
				extract_access.title_of_copy AS extract_title,
				extract.school_id AS creator_school_id,
				school.name AS creator_school_name,
				extract_access.accessor_school_id AS accessor_school_id,
				extract_access.accessor_school_name AS accessor_school_name,
				extract_access.ip_address AS ip_address,
				extract_access.user_agent AS user_agent,
				extract_access.date_created AS date_created,
				extract_access.user_id AS user_id
			FROM
				extract_access
				INNER JOIN asset on extract_access.asset_id = asset.id
				INNER JOIN extract INNER JOIN school on extract.school_id = school.id on extract_access.extract_id = extract.id
			WHERE
				extract_access.id > ${lastCompletedId}
				AND extract_access.id <= ${nextId}
				AND extract_access.extract_id IN (
					SELECT
						extract_id
					FROM
						extract_access
					WHERE
						id > ${lastCompletedId}
						AND id <= ${nextId}
					GROUP BY
						extract_id,
						DATE_TRUNC('minute', date_created)
					HAVING
						COUNT(id) >= 25
				)
		`);
		if (result.rowCount > 0) {
			// Only bother proceeding if some extracts have been viewed more than 25 times in any one minute
			await extract_access_email_sender(result.rows);
		}

		// Upsert a row into the database with the latest database ID we've checked.
		// The `extract_access_email_send_log` should only ever have a single row in it - we just update this row.
		await taskDetails.query(`
			INSERT INTO
				extract_access_email_send_log
				(id, last_completed_id)
			VALUES
				(1, ${nextId})
			ON CONFLICT (id) DO UPDATE SET
				last_completed_id = EXCLUDED.last_completed_id
		`);
	}

	//delete task from asynctask
	await taskDetails.deleteSelf();
	// Push this task back into the queue so it runs itself in about 5 minutes.
	await pushExtractAccessSendEmailCheckerTask(taskDetails);
};
