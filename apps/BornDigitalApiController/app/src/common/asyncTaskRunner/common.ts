import pg from "pg";

export interface ISettings {
	// Name of async route to execute when the callback is invoked.
	callback: string;

	// Optional date/time the callback should be executed. Undefined means 'execute during the next tick (typically within 2 minutes)'.
	dateToExecute?: Date;

	// Optional JSON-stringifiable object that will be passed to the async route as its only parameter when it is invoked. Defaults to null.
	data?: unknown;

	// Optional unique identifier for the task. If a task with this key already exists, the task is not inserted.
	key?: string;
}

/**
 * Push an async task into the task queue.
 * @param client A pool/client object to use to issue DB queries.
 */
export const pushTask = (settings: ISettings, client: pg.ClientBase | pg.Pool) => {
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
};

/**
 * Delete an async task from the `async_task` table.
 * @param databaseId The database ID of the task from the `async_task` table that should be deleted.
 * @param client A pool/client object to use to issue DB queries.
 */
export const deleteTask = (databaseId: number, client: pg.ClientBase | pg.Pool) => {
	return client.query(`DELETE FROM async_task WHERE id = $1`, [databaseId]);
};
