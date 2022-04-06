import AsyncTaskRunner from "../common/asyncTaskRunner/AsyncTaskRunner";

import generateExtractTask from "./generateExtractTask";

export default async (runner: AsyncTaskRunner) => {
	await generateExtractTask(runner);
};
