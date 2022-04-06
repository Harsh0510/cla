interface IQueue<T> {
	push: (task: T) => void;
	drain: () => Promise<void>;
}

const blockingQueue = <T>(worker: (task: T) => Promise<void>): IQueue<T> => {
	const tasks: T[] = [];

	let drainPromise: null | (() => void) = null;
	let isProcessing = false;

	const maybeDrain = () => {
		if (tasks.length) {
			return;
		}
		if (!drainPromise) {
			return;
		}
		const dp = drainPromise;
		drainPromise = null;
		dp();
	};

	const maybeProcessOne = () => {
		if (isProcessing) {
			return;
		}
		if (!tasks.length) {
			maybeDrain();
			return;
		}
		isProcessing = true;
		const task = tasks.shift() as T;
		worker(task)
			.catch(() => null)
			.finally(() => {
				isProcessing = false;
				setImmediate(maybeProcessOne);
			});
	};

	return {
		push: (task: T) => {
			tasks.push(task);
			setImmediate(maybeProcessOne);
		},
		drain: () =>
			new Promise((resolve: () => void) => {
				drainPromise = resolve;
				setImmediate(maybeDrain);
			}),
	};
};

export default blockingQueue;
