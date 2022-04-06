import pg from "pg";
import { pushTask, deleteTask, ISettings } from "./common";
import AsyncTaskDetails from "./AsyncTaskDetails";

type TRouteCallback = (task: AsyncTaskDetails) => Promise<void>;

/**
 * If a task is not found in the database (i.e. we've drained all the pending async tasks),
 * then we wait up to STARTING_TICK_DELAY milliseconds before checking for another task.
 */
const STARTING_TICK_DELAY = 1000;

/**
 * If a task is not found in the database (i.e. we've drained all the pending async tasks),
 * then we keep increasing the wait duration before checking for another task until it reaches
 * a maximum of MAX_TICK_DELAY milliseconds.
 *
 * Note that multiple processes may be checking for async tasks at the same time, so this is
 * only a maximum. If 4 processes are checking for tasks for example, there will be an average
 * of (MAX_TICK_DELAY / 4) milliseconds between checks.
 */
const MAX_TICK_DELAY = 20000;

/**
 * The AsyncTaskRunner class allows registering callbacks to be invoked exactly once at a later time.
 * The registered callbacks will be called even if the server is restarted.
 * Callbacks are registered by calling `this.route(name, callback)`.
 * It's kind of like CRON.
 */
class AsyncTaskRunner {
	private _routes: Record<string, TRouteCallback>;
	private _pgPool: pg.Pool;
	private _shouldExecute: boolean;
	private _tickBound: () => void;
	private _currentTickDelay: number;
	private _timeout: NodeJS.Timeout | undefined;

	/**
	 * @param {pg.Pool} pgPool A PG pool for the ApplicationModel database.
	 */
	constructor(pgPool: pg.Pool) {
		this._routes = Object.create(null);
		this._pgPool = pgPool;
		this._shouldExecute = false;
		this._tickBound = this._tick.bind(this);
		this._currentTickDelay = STARTING_TICK_DELAY;
	}

	/**
	 * Register a named route that can be invoked by enqueued async tasks.
	 * @param name The name of the task. Should not exceed 50 characters.
	 * @param callback The callback to be executed.
	 * It is passed the data described in the `pushTask` call, a `pg.Pool` for the Application Model, the database ID of this task in the `async_task` table, and the AsyncTaskRunner instance.
	 */
	route(name: string, callback: TRouteCallback) {
		this._routes[name] = callback;
	}

	getRoutes() {
		return this._routes;
	}

	deleteTask(databaseId: number): Promise<pg.QueryResult<object>> {
		return deleteTask(databaseId, this._pgPool);
	}

	pushTask(settings: ISettings): Promise<pg.QueryResult<object>> {
		return pushTask(settings, this._pgPool);
	}

	private async _tickOne(): Promise<boolean> {
		let didFindTask = false;
		let client = null;
		let foundTask = null;
		try {
			client = await this._pgPool.connect();
			await client.query("BEGIN");
			/**
			 * Important: make sure we SELECT ... FOR UPDATE.
			 * The FOR UPDATE is important to prevent other concurrent processes that might be executing this function at the same time from running the same task.
			 * A task should only be run at most once, so other processes should not execute the same task.
			 */
			const results = await client.query(`
				SELECT
					id,
					callback_name,
					data
				FROM
					async_task
				WHERE
					date_to_execute <= NOW()
				ORDER BY
					date_to_execute ASC
				LIMIT 1
				FOR UPDATE
			`);
			if (results.rowCount > 0) {
				didFindTask = true;
				const row = results.rows[0];
				foundTask = row;
				const callback = this._routes[row.callback_name];
				const taskDetails = new AsyncTaskDetails(row, client);
				if (typeof callback === "function") {
					// Swallow (but log) any errors to ensure the task is always deleted.
					// We don't want to attempt executing the same task over and over (preventing other tasks from executing) if it errors.
					try {
						console.log(new Date(), process.env["NODE_APP_INSTANCE"], "Async Task starting", row.id, row.callback_name);
						await callback(taskDetails);
						console.log(new Date(), process.env["NODE_APP_INSTANCE"], "Async Task ending", row.id, row.callback_name);
					} catch (e) {
						const ee = e as Error;
						console.log(`${new Date().toString()}: async task error [${ee.message}] [${ee.stack}]`, e, foundTask);
					}
				}
				try {
					await taskDetails.deleteSelf();
				} catch (e) {
					await deleteTask(row.id, this._pgPool);
					throw e;
				}
			}
			await client.query("COMMIT");
		} catch (e) {
			const ee = e as Error;
			console.log(`${new Date().toString()}: async task error [${ee.message}] [${ee.stack}]`, e, foundTask);
			if (client) {
				await client.query("ROLLBACK");
			}
		} finally {
			if (client) {
				client.release();
			}
		}
		return didFindTask;
	}

	private _tick() {
		if (!this._shouldExecute) {
			return;
		}
		this._tickOne().then((didFindTask) => {
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

export default AsyncTaskRunner;
