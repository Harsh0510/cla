process.env["TVF_APP_NAME"] = "AsyncTaskRunner";

import { loadEnvVars } from "./common/envLoader";

loadEnvVars(__dirname);

import db from "./common/db";
import AsyncTaskRunner from "./common/asyncTaskRunner/AsyncTaskRunner";
import asyncTaskRoutes from "./asyncTasks";
import log from "./common/log";

process.on("exit", (code: number) => {
	console.log(new Date(), process.env["NODE_APP_INSTANCE"], "AsyncRunner exiting with code: " + code);
});

process.on("uncaughtException", (error) => {
	log({
		message:
			"AsyncRunner - got an uncaught exception [" +
			process.env["NODE_APP_INSTANCE"] +
			"] - " +
			error.message +
			"//" +
			error.stack,
	});
	console.log(
		new Date(),
		process.env["NODE_APP_INSTANCE"],
		"AsyncRunner got an uncaught exception: ",
		error.message,
		error.stack
	);
});

console.log(new Date(), process.env["NODE_APP_INSTANCE"], "AsyncRunner starting");

(async () => {
	const asyncRunner = new AsyncTaskRunner(db);
	await asyncTaskRoutes(asyncRunner);
	asyncRunner.execute();
})();
