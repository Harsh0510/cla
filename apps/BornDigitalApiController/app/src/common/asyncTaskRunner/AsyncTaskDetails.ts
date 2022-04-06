import pg from "pg";
import { pushTask, deleteTask, ISettings } from "./common";

interface DbData {
	id: number;
	data?: unknown;
}

class AsyncTaskDetails {
	private _dbData: DbData;
	private _client: pg.ClientBase;

	/**
	 * @param dbData The data passed to `AsyncTaskRunner.pushTask()`.
	 * @param client Allows running queries on the ApplicationModel database.
	 */
	constructor(dbData: DbData, client: pg.ClientBase) {
		this._dbData = dbData;
		this._client = client;
	}

	/**
	 * Add an async task.
	 */
	pushTask(settings: ISettings) {
		return pushTask(settings, this._client);
	}

	/**
	 * Delete the current task from the database.
	 * @see `deleteTask` from `./common`.
	 */
	deleteSelf() {
		return deleteTask(this._dbData.id, this._client);
	}

	/**
	 * Execute a database query on the ApplicationModel database.
	 */
	query(sqlQuery: string, values?: unknown[]) {
		return this._client.query(sqlQuery, values);
	}

	/**
	 * Execute a database query on the ApplicationModel database.
	 */
	appDbQuery(sqlQuery: string, values?: unknown[]) {
		return this._client.query(sqlQuery, values);
	}

	/**
	 * @returns The database ID of this task in the `async_task` table.
	 */
	getDbId(): number {
		return this._dbData.id;
	}

	/**
	 * @returns The data that was initially passed to `AsyncTaskRunner.pushTask()` when the task was registered.
	 */
	getTaskData(): unknown | undefined | null {
		return this._dbData.data;
	}
}

export default AsyncTaskDetails;
