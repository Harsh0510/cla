const pg = require("../pg");

/**
 * Push an async task into the task queue.
 * @param {object} settings
 * @param {string} settings.callback Name of async route to execute when the callback is invoked.
 * @param {Date} settings.dateToExecute Optional date/time the callback should be executed. Undefined means 'execute during the next tick (typically within 2 minutes)'.
 * @param {object} settings.data Optional JSON-stringifiable object that will be passed to the async route as its only parameter when it is invoked. Defaults to null.
 * It must be possible to JSON stringify this value because it will be stored in the database!
 * @param {string} settings.key Optional unique identifier for the task. If a task with this key already exists, the task is not inserted.
 * @param {pg.Pool & pg.Client} client A pool/client object to use to issue DB queries.
 * @return {Promise<any>}
 */
function pushTask(settings, client) {
	let jsDateToExecute = settings.dateToExecute;
	if (!jsDateToExecute) {
		// If no date is provided, just pick some random date in the past so the task is executed during the next tick.
		jsDateToExecute = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	}
	if (!settings.key) {
		return client.query(
			`
				INSERT INTO
					async_task
					(date_to_execute, callback_name, data)
				VALUES
					($1, $2, $3)
			`,
			[jsDateToExecute, settings.callback, settings.data ? JSON.stringify(settings.data) : null]
		);
	}
	return client.query(
		`
			INSERT INTO
				async_task
				(date_to_execute, callback_name, data, key)
			VALUES
				($1, $2, $3, $4)
			ON CONFLICT(key) DO NOTHING
		`,
		[jsDateToExecute, settings.callback, settings.data ? JSON.stringify(settings.data) : null, settings.key]
	);
}

/**
 * Delete an async task from the `async_task` table.
 * @param {number} databaseId The database ID of the task from the `async_task` table that should be deleted.
 * @param {pg.Pool & pg.Client} client A pool/client object to use to issue DB queries.
 * @return {Promise<any>}
 */
function deleteTask(databaseId, client) {
	return client.query(`DELETE FROM async_task WHERE id = $1`, [databaseId]);
}

module.exports = {
	pushTask,
	deleteTask,
};
