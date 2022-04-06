const processOnAzureRaw = require("../../core/admin/processOnAzure");

const context = require("../common/Context");

let ctx, mockResultGetAllBlobsInContainer;

jest.mock("../../core/admin/azure/BlobService", () => {
	return class {
		init(a, b, c, d) {
			this.blobService = function () {
				() => jest.fn();
			};
		}

		constructor() {
			this.init.apply(this, arguments);
		}

		getAllBlobsInContainer(containerName) {
			return mockResultGetAllBlobsInContainer(containerName);
		}
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
	mockResultGetAllBlobsInContainer = (containerName) => {
		if (containerName === "pagecounts") {
			return [
				{
					name: "9780008144678___123.txt",
				},
				{
					name: "9780008144679___456.txt",
				},
			];
		}
		return [
			{
				name: "9780008144678.pdf",
			},
			{
				name: "9780008144679.pdf",
			},
		];
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/** Common function */
async function processOnAzure(data) {
	let err = null;
	try {
		ctx.body = await processOnAzureRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		connection_string: "connection_string_test",
		batch: {
			name: "batch-name",
			key: "batch-key",
			url: "batch-url",
		},
	};
}

test(`Error when not log-in or not cla-admin`, async () => {
	const params = getParams();
	ctx.sessionData.user_role = "teacher";
	const res = await processOnAzure(params);
	expect(res).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when connection string is invalid`, async () => {
	const params = getParams();
	params.connection_string = {
		key1: "value1",
	};
	const res = await processOnAzure(params);
	expect(res).toEqual(new Error("400 ::: Azure Blob Storage connection string invalid"));
});

test(`Error when Batch credentials not provided`, async () => {
	const params = getParams();
	delete params.batch;
	const res = await processOnAzure(params);
	expect(res).toEqual(new Error("400 ::: Batch credentials not provided"));
});

test(`Error when valid Batch credentials not provided`, async () => {
	const params = getParams();
	params.batch = "batch_credential";
	const res = await processOnAzure(params);
	expect(res).toEqual(new Error("400 ::: Batch credentials not provided"));
});

test(`Returns result Successfully`, async () => {
	const params = getParams();
	expect(await processOnAzure(params)).toBeNull();
	expect(ctx.body).toEqual({
		page_counts: ["9780008144678", "9780008144679"],
		raw_uploads: ["9780008144678", "9780008144679"],
		isbns: [],
	});
});
