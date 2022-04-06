const pg = require("../pg");
const { pushTask, deleteTask } = require("./common");
const AsyncTaskDetails = require("./AsyncTaskDetails");
const consoleLog = require("../../common/consoleLog");

/**
 * If a task is not found in the database (i.e. we've drained all the pending async tasks),
 * then we wait up to STARTING_TICK_DELAY milliseconds before checking for another task.
 */
const STARTING_TICK_DELAY = 300;

/**
 * If a task is not found in the database (i.e. we've drained all the pending async tasks),
 * then we keep increasing the wait duration before checking for another task until it reaches
 * a maximum of MAX_TICK_DELAY milliseconds.
 *
 * Note that multiple processes may be checking for async tasks at the same time, so this is
 * only a maximum. If 4 processes are checking for tasks for example, there will be an average
 * of (MAX_TICK_DELAY / 4) milliseconds between checks.
 */
const MAX_TICK_DELAY = 60000;

/**
 * The AsyncTaskRunner class allows registering callbacks to be invoked exactly once at a later time.
 * The registered callbacks will be called even if the server is restarted.
 * Callbacks are registered by calling `this.route(name, callback)`.
 * It's kind of like CRON.
 */
class AsyncTaskRunner {
	/**
	 * @param {pg.Pool} pgPool A PG pool for the ApplicationModel database.
	 */
	constructor(pgPool) {
		this._routes = Object.create(null);
		this._pgPool = pgPool;
		this._shouldExecute = false;
		this._tickBound = this._tick.bind(this);
		this._currentTickDelay = STARTING_TICK_DELAY;
	}

	/**
	 * Register a named route that can be invoked by enqueued async tasks.
	 * @param {string} name The name of the task. Should not exceed 50 characters.
	 * @param {(task: AsyncTaskDetails) => Promise<any>} callback The callback to be executed.
	 * It is passed the data described in the `pushTask` call, a `pg.Pool` for the Application Model, the database ID of this task in the `async_task` table, and the AsyncTaskRunner instance.
	 */
	route(name, callback) {
		this._routes[name] = callback;
	}

	/**
	 * @see `deleteTask`
	 * @returns {Promise<any>}
	 */
	deleteTask(databaseId) {
		return deleteTask(databaseId, this._pgPool);
	}

	/**
	 * @param {object} settings. See `pushTask` in `common.js`
	 * @return {Promise<any>}
	 */
	pushTask(settings) {
		return pushTask(settings, this._pgPool);
	}

	/**
	 * @returns {Promise<didFindTask: boolean>}
	 */
	async _tickOne() {
		let didFindTask = false;
		try {
			const results = await this._pgPool.query(`
				SELECT
					id,
					callback_name,
					data
				FROM
					async_task
				WHERE
					date_to_execute <= NOW()
				ORDER BY
					RANDOM()
				LIMIT 1
			`);
			if (results.rowCount > 0) {
				didFindTask = true;
				const row = results.rows[0];
				const callback = this._routes[row.callback_name];
				const taskDetails = new AsyncTaskDetails(row, this._pgPool);

				// logging when each task runs
				consoleLog(
					`=== Async task ${taskDetails._dbData.callback_name} is running at ${new Date().toISOString()} on process ${
						process.env.NODE_APP_INSTANCE
					} ===`
				);
				if (typeof callback === "function") {
					// Swallow (but log) any errors to ensure the task is always deleted.
					// We don't want to attempt executing the same task over and over (preventing other tasks from executing) if it errors.
					try {
						await callback(taskDetails);
					} catch (e) {
						consoleLog(`${new Date().toString()}: async task error [${e.message}] [${e.stack}]`);
					}
				}
				await taskDetails.deleteSelf();
				// logging when each task finishes
				consoleLog(
					`=== Async task ${taskDetails._dbData.callback_name} FINISHED at ${new Date().toISOString()} on process ${
						process.env.NODE_APP_INSTANCE
					} ===`
				);
			}
		} catch (e) {
			consoleLog(`${new Date().toString()}: async task error [${e.message}] [${e.stack}]`);
		}
		return didFindTask;
	}

	_tick() {
		if (!this._shouldExecute) {
			return;
		}
		this._tickOne().then((didFindTask) => {
			if (!this._shouldExecute) {
				return;
			}
			let waitDelay;
			if (didFindTask) {
				waitDelay = 50;
				this._currentTickDelay = STARTING_TICK_DELAY;
			} else {
				// Generate a random delay that (on average) gets bigger every time.
				// The random delay reduces the chances of other processes attempting to check for tasks at the same time.
				waitDelay = this._currentTickDelay * Math.random() + 50;
				this._currentTickDelay = Math.min(MAX_TICK_DELAY, this._currentTickDelay * 2);
			}
			this._timeout = setTimeout(this._tickBound, waitDelay);
		});
	}

	forceTick() {
		return this._tickOne();
	}

	execute() {
		this.stop();
		this._shouldExecute = true;
		this._timeout = setTimeout(this._tickBound, 5000);
	}

	stop() {
		this._shouldExecute = false;
		if (this._timeout) {
			clearTimeout(this._timeout);
		}
	}
}

module.exports = AsyncTaskRunner;
