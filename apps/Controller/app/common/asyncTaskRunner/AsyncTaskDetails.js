const { Pool } = require("../pg");
const { pushTask, deleteTask } = require("./common");

/**
 * @property {}
 */
class AsyncTaskDetails {
	/**
	 * @param {any} dbData The data passed to `AsyncTaskRunner.pushTask()`.
	 * @param {Pool} pool Allows running queries on the ApplicationModel database OUTSIDE of the transaction.
	 */
	constructor(dbData, pool) {
		this._dbData = dbData;
		this._pool = pool;
	}

	/**
	 * Add an async task.
	 * @see `pushTask` from `./common`.
	 * @param {*} settings
	 * @returns {Promise<any>}
	 */
	pushTask(settings) {
		return pushTask(settings, this._pool);
	}

	/**
	 * Delete the current task from the database.
	 * @see `deleteTask` from `./common`.
	 * @returns {Promise<any>}
	 */
	deleteSelf() {
		return deleteTask(this._dbData.id, this._pool);
	}

	/**
	 * Execute a database query on the ApplicationModel database.
	 * @param  {...any} args
	 * @returns {Promise<any>}
	 */
	query(...args) {
		return this._pool.query(...args);
	}

	/**
	 * Execute a database query on the ApplicationModel database.
	 * @param  {...any} args
	 */
	appDbQuery(...args) {
		return this._pool.query(...args);
	}

	/**
	 * @returns {Pool}
	 */
	getAppDbPool() {
		return this._pool;
	}

	/**
	 * @returns {number} The database ID of this task in the `async_task` table.
	 */
	getDbId() {
		return this._dbData.id;
	}

	/**
	 * @returns The data that was initially passed to `AsyncTaskRunner.pushTask()` when the task was registered.
	 */
	getTaskData() {
		return this._dbData.data;
	}
}

module.exports = AsyncTaskDetails;
