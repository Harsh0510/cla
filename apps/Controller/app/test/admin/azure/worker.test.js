let mockThrowException = false;

/**
 * mock for go (worker-lib)
 */
jest.mock(`../../../core/admin/azure/worker-lib`, () => {
	return async function () {
		return true;
	};
});

process.exit = (test) => {
	return;
};

const workerRaw = require(`../../../core/admin/azure/worker`);

/**
 * Mock for console.log
 */
global.console = { log: jest.fn() };

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockThrowException = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function worker(data) {
	const ret = {
		result: null,
		error: null,
	};
	try {
		ret.result = workerRaw;
	} catch (e) {
		ret.error = e;
	}
	return ret;
}

test(`Successfull when calling the worker`, () => {
	const result = worker();
	expect(result.error).toEqual(undefined);
});

test(`Throw Exception`, () => {
	jest.resetModules();
	global.console = {
		error: jest.fn(),
		log: jest.fn(),
	};
	jest.mock(`../../../core/admin/azure/worker-lib`, () => {
		return async function () {
			throw new Error("Unknown Error");
		};
	});
	const workerRaw = require(`../../../core/admin/azure/worker`);
	let err = null;
	let result = null;
	try {
		result = workerRaw;
	} catch (e) {
		err = e;
	}
	expect(result).toEqual({});
	expect(err).toEqual(null);
});
