import AsyncTaskDetails from "../../common/asyncTaskRunner/AsyncTaskDetails";
import AsyncTaskRunner from "../../common/asyncTaskRunner/AsyncTaskRunner";
import execute from "./execute";

const routeName = `/admin/generate-extract-task`;

const pushTask = async (taskPusher: AsyncTaskRunner | AsyncTaskDetails) => {
	const dt = new Date();
	dt.setMinutes(dt.getMinutes() + 5);
	return taskPusher.pushTask({
		key: routeName,
		callback: routeName,
		dateToExecute: dt,
	});
};

const register = async (runner: AsyncTaskRunner) => {
	runner.route(routeName, async (details: AsyncTaskDetails) => {
		try {
			await execute(details.appDbQuery.bind(details));
		} finally {
			await details.deleteSelf();
			await pushTask(details);
		}
	});
};

export default async function (runner: AsyncTaskRunner) {
	await register(runner);
	await pushTask(runner);
}
