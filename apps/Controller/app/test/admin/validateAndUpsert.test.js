const Context = require("../common/Context");

let ctx,
	files = null,
	mockProcessResult = true,
	mockUpsertResult = true;
/**
 * fs
 */
jest.mock(`fs`, () => {
	return {
		readFile: `read!`,
		unlink: `unlink!`,
	};
});

const mockReadFileSync = async (filePath) => {
	return 10;
};

const mockUnlinkSync = async (filePath) => {
	return "success";
};

/**
 * util
 */
jest.mock(`util`, () => {
	return {
		promisify: (func) => {
			if (func === "read!") {
				return mockReadFileSync;
			} else if (func === "unlink!") {
				return mockUnlinkSync;
			} else {
				throw new Error("should never be here");
			}
		},
	};
});

/**
 * core/admin/lib/util
 */
jest.mock(`../../core/admin/lib/util`, () => {
	return {
		getFlattenedProducts: function () {
			return [
				{
					pdfIsbn13: "9123456789001",
					errors: [],
				},
			];
		},
		getErrorsOnly: function () {
			return { errors: [] };
		},
	};
});

/**
 * BlobService
 */
jest.mock(`../../core/admin/azure/BlobService`, () => {
	return class {
		constructor() {
			this.blobService = {
				host: "localhost",
			};
			this.downloadBlob = (BlobService, isbn13) => {
				return;
			};
		}
		async getAllBlobsInContainer(content) {
			if (content === "pagecounts") {
				return [
					{
						name: "9123456789001___123.txt",
					},
				];
			} else if (content === "coverpages") {
				return [
					{
						name: "9123456789001.png",
					},
				];
			} else if (content === "rawuploads") {
				return [
					{
						name: "9123456789001.epub",
					},
				];
			}
			return [];
		}
		async getAllDirectoriesInContainer(content) {
			if (content === "highqualitypages" || content === "pagepreviews") {
				return [
					{
						name: "9123456789001/",
					},
				];
			} else if (content === "pagecounts") {
				return [
					{
						name: "9123456789001___123.txt",
					},
				];
			}
			return [];
		}
	};
});

/**
 * BlobResource
 */
jest.mock(`../../core/admin/azure/BlobResource`, () => {
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

/**
 * playgroundAssetValidator
 */
jest.mock(`../../core/admin/parseUploads/playgroundAssetValidator`, () => {
	return function () {
		return {
			process: (assets) => {
				if (mockProcessResult) {
					return [
						{
							errors: [],
							products: [
								{
									pdfIsbn13: "9123456789001",
									errors: [],
								},
							],
						},
					];
				} else {
					throw new Error("Unknow error");
				}
			},
		};
	};
});

/**
 * DataUpserter
 */
jest.mock(`../../core/admin/parseUploads/DataUpserter`, () => {
	return class {
		constructor() {}
		setDatabaseQuerier(pool) {}
		async upsert(product) {
			if (mockUpsertResult) {
				return;
			} else {
				throw new Error("Unknow error");
			}
		}
		async deleteOrphanedRecords() {}
		async updateAssets() {}
	};
});

const upsertPhaseOneRaw = require("../../core/admin/validateAndUpsert").upsertPhaseOne;
const upsertPhaseTwoRaw = require("../../core/admin/validateAndUpsert").upsertPhaseTwo;

function getValidRequest() {
	return {
		azure_connection_string: "connection_string_test1",
		return_errors_only: false,
		assets: null,
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	files = {
		assets: [
			{
				name: "9123456789001.pdf",
			},
			{
				name: "9123456789002.pdf",
			},
		],
	};
	mockProcessResult = true;
	mockUpsertResult = true;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function upsertPhaseOne(data) {
	let error = null;
	try {
		ctx.body = await upsertPhaseOneRaw(data, ctx, files);
	} catch (e) {
		error = e;
	}
	return error;
}

async function upsertPhaseTwo(data) {
	let error = null;
	try {
		ctx.body = await upsertPhaseTwoRaw(data, ctx);
	} catch (e) {
		error = e;
	}
	return error;
}

//Error "Unauthorized" when user role is not cla-admin
test(`Error "Unauthorized" when user role is not cla-admin`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	expect(await upsertPhaseOne(data)).toEqual(new Error("401 ::: Unauthorized"));
});

//As default value
test(`Success`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(null);
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
	expect(ctx.body.results.products).toEqual([{ pdfIsbn13: "9123456789001", errors: [] }]);
	expect(ctx.body.results.upsertErrors).toEqual([]);
});

// pass files as object
test(`Success when files as object`, async () => {
	let funResult = null;
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	files = {
		assets: {
			name: "9123456789001.pdf",
		},
	};
	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(null);
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
	expect(ctx.body.results.products).toEqual([{ pdfIsbn13: "9123456789001", errors: [] }]);
	expect(ctx.body.results.upsertErrors).toEqual([]);
});

//As default value
test(`Success`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(null);
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
	expect(ctx.body.results.products).toEqual([{ pdfIsbn13: "9123456789001", errors: [] }]);
	expect(ctx.body.results.upsertErrors).toEqual([]);
});

//pass files as null
test(`Success when files as null`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	files = null;
	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(null);
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
	expect(ctx.body.results.products).toEqual([{ pdfIsbn13: "9123456789001", errors: [] }]);
	expect(ctx.body.results.upsertErrors).toEqual([]);
});

// muliple asset with actual data
test(`Success when files as object`, async () => {
	let funResult = null;
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	files = {
		assets: [
			{
				name: "9123456789001.pdf",
			},
			{
				name: "9123456789002.pdf",
			},
		],
	};
	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(new Error("400 ::: readFileSync is not a function"));
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
	expect(ctx.body.results.products).toEqual([{ pdfIsbn13: "9123456789001", errors: [] }]);
	expect(ctx.body.results.upsertErrors).toEqual([]);
});

// muliple asset with actual data and params return_errors_only as true
test(`Success when files as object`, async () => {
	let funResult = null;
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.return_errors_only = true;
	files = {
		assets: [
			{
				name: "9123456789001.pdf",
			},
			{
				name: "9123456789002.pdf",
			},
		],
	};
	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(new Error("400 ::: readFileSync is not a function"));
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
	expect(ctx.body.results.products).toEqual([{ pdfIsbn13: "9123456789001", errors: [] }]);
	expect(ctx.body.results.upsertErrors).toEqual([]);
});

test(`Success when assets are passed as an array`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.assets = ["asset1"];
	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(null);
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
	expect(ctx.body.results.products).toEqual([{ pdfIsbn13: "9123456789001", errors: [] }]);
	expect(ctx.body.results.upsertErrors).toEqual([]);
});

test(`Success when assets are not passed as an array`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.assets = "asset1";
	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(null);
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
	expect(ctx.body.results.products).toEqual([{ pdfIsbn13: "9123456789001", errors: [] }]);
	expect(ctx.body.results.upsertErrors).toEqual([]);
});

test(`get Azure Data`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	data.azure_connection_string = "asset1";
	expect(await upsertPhaseTwo(data)).toEqual(null);
	expect(ctx.body).not.toEqual(null);
});

//Error "Azure connection string not provided"
test(`Error "Azure connection string not provided"`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	delete data.azure_connection_string;
	expect(await upsertPhaseTwo(data)).toEqual(new Error("400 ::: Azure connection string not provided"));
});

test(`Error when handle azure data process`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	mockProcessResult = false;

	const data = getValidRequest();
	data.assets = "asset1";
	data.azure_data = [
		{
			errors: [],
			products: [
				{
					pdfIsbn13: "9123456789001",
					errors: [],
				},
			],
		},
	];
	expect(await upsertPhaseOne(data)).toEqual(new Error("400 ::: Unknow error"));
	expect(ctx.body).toEqual(null);
});

test(`Success when handle azure data process`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	mockProcessResult = true;

	const data = getValidRequest();
	data.assets = "asset1";
	data.azure_data = [
		{
			errors: [],
			products: [
				{
					pdfIsbn13: "9123456789001",
					errors: [],
				},
			],
		},
	];
	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(null);
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
});

test(`Error when handle upsert data process`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	mockUpsertResult = false;

	const data = getValidRequest();
	data.assets = "asset1";

	expect(await upsertPhaseOne(data)).toEqual(null);
	expect(ctx.body).not.toEqual(null);
	expect(ctx.body.results.xmlErrors).toEqual({ errors: [] });
	expect(ctx.body.results.results).toEqual([{ errors: [], products: [{ errors: [], pdfIsbn13: "9123456789001" }] }]);
	expect(ctx.body.results.upsertErrors.length).toEqual(1);
});
