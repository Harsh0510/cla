const Batch = require("../../../core/admin/azure/Batch");

const util = require("util");
const crypto = require("crypto");

//const azureBatch = require('azure-batch');
const moment = require("moment");
const genRandomBytes = util.promisify(crypto.randomBytes);

let mockCredentials, mockGetResult, mockPoolId, mockGetError, mockAddError;
let mockJobAddError;
let mockTaskAddError;

//stroe the result and error from promise resuest
let promisResult = null;
let catchError = null;

JSON.parse = jest.fn().mockImplementationOnce((value) => {
	return value;
});

jest.mock("azure-batch", () => {
	return {
		SharedKeyCredentials: class {
			constructor(accountName, accountKey) {}
		},
		ServiceClient: class {
			constructor(credentials, accountUrl) {
				this.pool = {
					add: (poolconfig, callback) => {
						callback(mockAddError);
					},
					get: (mockPoolId, callback) => {
						callback(mockGetError, mockGetResult);
					},
				};
				this.job = {
					add: (config, callback) => {
						callback(mockJobAddError);
					},
				};
				this.task = {
					add: (jobId, config, callback) => {
						setTimeout(() => {
							callback(mockTaskAddError);
						}, 1);
						return "Task 1";
					},
				};
			}
		},
	};
});

jest.mock("../../../core/admin/azure/BlobResource", () => {
	return class {
		constructor(containerName, blobName) {
			this.containerName = containerName;
			this.blobName = blobName;
			this.blobService = {
				host: "localhost",
			};
		}
	};
});

const BlobService = class {
	constructor() {
		this.blobService = {
			host: "localhost",
		};
	}

	generateSasToken(blobResource, strKey) {
		return {
			uri: "test result uri",
			token: "1545454654654654654654654613213",
		};
	}
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockCredentials = {
		name: "test azure account",
		key: "12121212121212121212",
		url: "localhost",
	};

	mockPoolId = 1;
	mockGetError = null;
	mockAddError = null;
	promisResult = null;
	mockGetResult = null;
	catchError = null;

	mockJobAddError = null;
	JSON.parse = jest.fn().mockImplementationOnce((value) => {
		return value;
	});

	mockTaskAddError = null;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

describe("setting for generateId", () => {
	test("success generateId", async () => {
		const batch = new Batch({}, mockCredentials);
		const batchGenerateId = await batch.generateId(32);
		expect(batchGenerateId).not.toBeNull();
	});

	test("success generateId with env process credentials", async () => {
		process.env.AZURE_BATCH_ACCOUNT_NAME = mockCredentials.name;
		process.env.AZURE_BATCH_ACCOUNT_KEY = mockCredentials.key;
		process.env.AZURE_BATCH_ACCOUNT_URL = mockCredentials.url;
		const batch = new Batch({});
		const batchGenerateId = await batch.generateId(32);
		expect(batchGenerateId).not.toBeNull();
	});
});

describe("setting for create pool", () => {
	mockPoolId = 32;

	test("success createPool", async () => {
		mockGetResult = {
			state: "active",
		};
		const batch = new Batch({}, mockCredentials);
		try {
			promisResult = await batch.createPool(mockPoolId);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toEqual({ state: "active" });
		expect(catchError).toBeNull();
	});

	test('Error "PoolExists" when createPool', async () => {
		mockAddError = {
			response: {
				body: { code: "PoolExists" },
			},
		};
		mockGetResult = {
			state: "active",
		};
		const batch = new Batch({}, mockCredentials);
		try {
			promisResult = await batch.createPool(mockPoolId);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toEqual({ state: "active" });
		expect(catchError).toBeNull();
	});

	test('Error "[unknown]" when createPool', async () => {
		mockAddError = {
			response: {
				body: null,
			},
		};
		mockGetError = {
			statusCode: 404,
		};
		mockGetResult = {
			state: "active",
		};
		const batch = new Batch({}, mockCredentials);
		try {
			promisResult = await batch.createPool(mockPoolId);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toBeNull();
		expect(catchError).toEqual("[unknown]");
	});

	test('Error "Pool not found" when createPool', async () => {
		mockGetError = {
			statusCode: 404,
		};
		mockGetResult = {
			state: "active",
		};
		promisResult = null;
		catchError = null;
		const batch = new Batch({}, mockCredentials);
		try {
			promisResult = await batch.createPool(mockPoolId);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toBeNull();
		expect(catchError).toEqual("Pool not found");
	});

	test('Error "Unknown error: " when createPool', async () => {
		mockGetError = {
			statusCode: 400,
		};
		mockGetResult = {
			state: "active",
		};
		promisResult = null;
		catchError = null;
		const batch = new Batch({}, mockCredentials);
		try {
			promisResult = await batch.createPool(mockPoolId);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toBeNull();
		expect(catchError).toEqual("Unknown error: 400");
	});
});

describe("setting for addJobToPool", () => {
	mockPoolId = 32;
	let mockJobId = 10001;

	test("Success addJobToPool", async () => {
		promisResult = null;
		catchError = null;
		const blobService = new BlobService();
		const batch = new Batch(blobService, mockCredentials);
		try {
			promisResult = await batch.addJobToPool(mockPoolId, mockJobId);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toEqual(undefined);
		expect(catchError).toBeNull();
	});

	test("Error addJobToPool when ret.code is JobExists", async () => {
		mockJobAddError = {
			response: {
				body: {
					code: "JobExists",
				},
			},
		};

		promisResult = null;
		catchError = null;
		const blobService = new BlobService();
		const batch = new Batch(blobService, mockCredentials);
		try {
			promisResult = await batch.addJobToPool(mockPoolId, mockJobId);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toEqual(undefined);
		expect(catchError).toBeNull();
	});

	test("Error addJobToPool when ret.code is not JobExists", async () => {
		mockJobAddError = {
			response: {
				body: {
					code: "NotFound",
				},
			},
		};
		promisResult = null;
		catchError = null;
		const blobService = new BlobService();
		const batch = new Batch(blobService, mockCredentials);
		try {
			promisResult = await batch.addJobToPool(mockPoolId, mockJobId);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toEqual(null);
		expect(catchError).toEqual(mockJobAddError);
	});

	test("Error addJobToPool when error dont have response.body", async () => {
		mockJobAddError = {
			message: "Not found",
		};
		promisResult = null;
		catchError = null;
		const blobService = new BlobService();
		const batch = new Batch(blobService, mockCredentials);
		try {
			promisResult = await batch.addJobToPool(mockPoolId, mockJobId);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toEqual(null);
		expect(catchError).toEqual(mockJobAddError);
	});
});

describe("setting for submit", () => {
	mockPoolId = 32;
	const mockItems = [
		"Test",
		{
			isbn: "9876543210123",
			type: "type 1",
		},
	];

	test("Success when submit the items", async () => {
		mockGetError = null;
		mockAddError = null;
		mockJobAddError = null;
		mockTaskAddError = null;
		promisResult = null;
		catchError = null;
		mockGetResult = {
			state: "active",
		};
		const blobService = new BlobService();
		const batch = new Batch(blobService, mockCredentials);
		try {
			promisResult = await batch.submit(mockItems);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toEqual(["Task 1", "Task 1"]);
		expect(catchError).toBeNull();
	});

	test("Error when submit the items", async () => {
		mockGetError = null;
		mockAddError = null;
		mockJobAddError = null;
		mockTaskAddError = {
			error: "something has been wrong!",
		};
		promisResult = null;
		catchError = null;
		mockGetResult = {
			state: "active",
		};
		const blobService = new BlobService();
		const batch = new Batch(blobService, mockCredentials);
		try {
			promisResult = await batch.submit(mockItems);
		} catch (e) {
			catchError = e;
		}
		expect(promisResult).toEqual(null);
		expect(catchError).toEqual(mockTaskAddError);
	});
});
