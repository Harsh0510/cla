let mockOutputs = {},
	mockLogFunction,
	mockLogData,
	mockAssetMetaData,
	mockResultExecFilePromise;

const mockOpenSync = (filePath, mode) => {
	if (filePath.match(/_errors\.log$/)) {
		return (mockOutputs.errors = {
			output: ``,
			mode: mode,
		});
	}
	if (filePath.match(/pagecount\.txt$/)) {
		return (mockOutputs.pagecount = {
			output: ``,
			mode: mode,
		});
	}
	throw new Error(`Unknown file path: ` + filePath);
};
const mockWriteSync = (handle, msg) => {
	if (handle.mode.indexOf("a") >= 0) {
		handle.output += msg;
	} else if (handle.mode.indexOf("w") >= 0) {
		handle.output = msg;
	}
};
global.console = { log: jest.fn() };
jest.mock("fs", () => {
	return {
		openSync: mockOpenSync,
		writeSync: mockWriteSync,
		writeFileSync(filePath, msg) {
			return mockWriteSync(mockOpenSync(filePath, "w"), msg);
		},
		chmod: (loc, test, cb) => {
			cb();
		},
		unlinkSync: (imgOutPath) => {
			return;
		},
	};
});

const workerLibRaw = require("../../../core/admin/azure/worker-lib");

let mockIsBlobExist, mockProcess, mockExceError, mockSelectResult;

jest.mock("../../../core/admin/azure/SharedBlobService", () => {
	return class {
		constructor() {}
		init() {}
		async downloadBlob(blobResource, loc) {
			return;
		}
		async doesBlobExist(containerName, blobName, callback) {
			return mockIsBlobExist;
		}
		async uploadFile(localFilePath, blobResource, props) {
			return "uploaded";
		}
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

jest.mock("../../../core/admin/lib/generatePdfThumbnail", () => {
	return async function () {
		return;
	};
});

jest.mock("../../../core/admin/lib/generatePdfPagePreviews/index", () => {
	return async function () {
		return ["page0", "page1", "page2"];
	};
});

jest.mock("../../../core/admin/lib/generatePdfHighQualityImages/index", () => {
	return async function () {
		return ["page0", "page1", "page2"];
	};
});

jest.mock("../../../core/admin/lib/getPdfPageCount/index", () => {
	return async function () {
		return 3;
	};
});

jest.mock(`../../../core/admin/lib/execPromise`, () => {
	return async function () {
		if (mockExceError) {
			throw mockExceError;
		}
		return;
	};
});

jest.mock(`../../../core/admin/lib/execFilePromise`, () => {
	return async function () {
		return mockResultExecFilePromise;
	};
});

jest.mock("child_process", () => {
	return {
		exec: (command, obj, callback) => {
			callback(mockExceError);
		},
	};
});

jest.mock("pg", () => {
	return {
		Client: class {
			constructor(connectionString, statement_timeout) {
				this.connectionString = connectionString;
				this.statement_timeout = statement_timeout;
			}
			async connect() {
				return;
			}
			end() {
				return;
			}
			async query(query) {
				if (query.indexOf("BEGIN") !== -1) {
					return;
				} else if (query.indexOf("COMMIT") !== -1) {
					mockIsQueryCommited = true;
				} else if (query.indexOf("SELECT") !== -1) {
					if (mockSelectResult == 1) {
						return { rows: [{ should_blur: true }], rowCount: 1 };
					} else if (mockSelectResult == 0) {
						return { rows: [{ should_blur: false }], rowCount: 1 };
					} else if (mockSelectResult == -1) {
						return { rows: [], rowCount: 0 };
					}
					throw new Error("unknown error");
				}
			}
		},
	};
});

jest.mock("axios", () => {
	return {
		post: async function (api, params, headers) {
			return mockAssetMetaData;
		},
	};
});

/**
 * util
 */
jest.mock(`util`, () => {
	return {
		promisify: (argv) => {
			return function (value) {
				return "TestValue: " + value;
			};
		},
	};
});

jest.mock("../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, 0);
	};
});

let stdoutOutput = "";

const origProcess = process;

mockLogFunction = (log) => {
	mockLogData.push(log);
};
/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockLogData = [];

	stdoutOutput = "";
	mockIsBlobExist = false; //cover image not exists
	mockISBN13 = "9876543210";
	mockProcess = {
		argv: [
			"arg0",
			"arg1",
			"CONTROLLER_API_BASE",
			"9876543210", //ISBN
			"CONTAINER_TOKEN_RAW_UPLOADS", //CONTAINER_TOKEN_RAW_UPLOADS
			"CONTAINER_TOKEN_COVER_PAGES", //CONTAINER_TOKEN_COVER_PAGES
			"CONTAINER_TOKEN_PAGE_PREVIEWS", //CONTAINER_TOKEN_PAGE_PREVIEWS
			"CONTAINER_TOKEN_HIGH_QUALITY_PAGES", //CONTAINER_TOKEN_HIGH_QUALITY_PAGES
			`{ "test" : {"obj1" : "test1", "obj2" : "test2" } }`, //blobServiceHost
			10, //CONTAINER_TOKEN_PAGE_COUNTS
			"pdf", //epub OR IS_EPUB
			"readonly postgres connection uri", //the readonly postgres connection uri
			true,
			true,
			"container sas url to private assets", //container sas url to private assets (contains ghostscript and magick binaries)
			"container sas url to raw cover pages", //container sas url to raw cover pages
		],
		stdout: {
			write(msg) {
				stdoutOutput += msg.toString();
			},
		},
	};
	process = mockProcess;
	mockBlobResource = {};
	mockExceError = null;
	mockSelectResult = 1;
	mockAssetMetaData = {
		data: {
			data: {
				id: "1",
				isbn: "9876543210",
				title: "Asset title 1",
				imprint: "puffin",
				publisher: "penguin random house children's uk",
			},
		},
	};
	mockResultExecFilePromise = "900/1200";
}

/**
 * Clear everything before and after each test
 */
beforeEach(() => {
	jest.resetModules();
	resetAll();
});
afterEach(() => {
	resetAll();
	process = origProcess;
});

jest.setTimeout(30000);

async function workerLib() {
	const ret = {
		result: null,
		error: null,
	};
	try {
		ret.result = await workerLibRaw(mockLogFunction, mockProcess.argv);
	} catch (e) {
		ret.error = e;
	}
	return ret;
}
expect.extend({
	toContainObject(received, argument) {
		const pass = this.equals(received, expect.arrayContaining([expect.objectContaining(argument)]));

		if (pass) {
			return {
				message: () => `expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`,
				pass: true,
			};
		} else {
			return {
				message: () => `expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(argument)}`,
				pass: false,
			};
		}
	},
});

describe("For pdf files", () => {
	test("Successfully called the function", async () => {
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded PDF asset" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});
	test("Success when cover image already exists - not creating", async () => {
		mockIsBlobExist = true;
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded PDF asset" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Cover image already exists - not creating" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});
	test("Success when publisher blurry_preview_images as false", async () => {
		mockIsBlobExist = true;
		mockSelectResult = 0;
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded PDF asset" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Cover image already exists - not creating" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});
	test("Success when publisher blurry_preview_images data not found", async () => {
		mockIsBlobExist = true;
		mockSelectResult = -1;
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded PDF asset" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Cover image already exists - not creating" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});
	test("Success when Also uploaded ALL good quality page previews", async () => {
		mockProcess.argv[13] = "1";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded PDF asset" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Generated 3 high quality pages" });
		expect(mockLogData).toContainObject({ content: "Uploaded high quality page 0" });
		expect(mockLogData).toContainObject({ content: "Also uploaded good quality page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded high quality page 1" });
		expect(mockLogData).toContainObject({ content: "Also uploaded good quality page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded high quality page 2" });
		expect(mockLogData).toContainObject({ content: "Also uploaded good quality page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded all high quality pages and high quality page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});
	test("Success when Skipped generating high quality pages", async () => {
		mockProcess.argv[12] = null;
		mockProcess.argv[13] = null;
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded PDF asset" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });

		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});
	test("Fail when publisher blurry_preview_images query throws an error", async () => {
		mockIsBlobExist = true;
		mockSelectResult = -2;
		const funResult = await workerLib();
		expect(funResult.error).not.toBeNull();
	});
});

describe("For epub files", () => {
	test("Throw Error when metadata not found", async () => {
		mockAssetMetaData = {
			data: {
				data: null,
			},
		};
		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error(
				`Metadata not found - this usually means the asset wasn't uploaded (either because it didn't exist or because a metadata error occurred).`
			)
		);
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	});

	test("Throw Error when cover image aspect ratio is out of range", async () => {
		mockProcess.argv[10] = "epub";
		mockResultExecFilePromise = "200/2000";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error("[Publisher: penguin random house children's uk; Imprint: puffin; Cover Aspect: 0.1] [Cover image aspect not allowed]")
		);
	});

	test("Throw Error when publisher and imprint not provided", async () => {
		mockAssetMetaData = {
			data: {
				data: { id: "1", isbn: "9876543210", title: "asset title 1" },
			},
		};
		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(new Error("[Publisher: ; Imprint: ; Cover Aspect: 0.75] [Unrecognised publisher]"));
	});

	test("Throw Error when publisher and imprint not valid", async () => {
		mockAssetMetaData = {
			data: {
				data: { id: "1", isbn: "9876543210", title: "Asset title 1", imprint: "Test imprint", publisher: "Test publisher" },
			},
		};
		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(new Error("[Publisher: test publisher; Imprint: test imprint; Cover Aspect: 0.75] [Unrecognised publisher]"));
	});

	test("Success when imprint as `puffin`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `puffin`;
		mockResultExecFilePromise = "800/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"puffin","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `penguin`", async () => {
		mockProcess.argv[10] = "epub";
		mockAssetMetaData = {
			data: {
				data: {
					id: "1",
					isbn: "9876543210",
					title: "Asset title 1",
					imprint: "penguin",
					publisher: "penguin books ltd",
				},
			},
		};
		const funResult = await workerLib();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: 'Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"penguin","publisher":"penguin books ltd"})',
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (900x1200)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
		expect(funResult.error).toBeNull();
	});

	test("Success when valid publisher provided", async () => {
		mockProcess.argv[10] = "epub";
		mockAssetMetaData = {
			data: {
				data: {
					id: "1",
					isbn: "9876543210",
					title: "Asset title 1",
					imprint: "",
					publisher: "spck",
				},
			},
		};
		const funResult = await workerLib();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: 'Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"","publisher":"spck"})',
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (900x1200)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
		expect(funResult.error).toBeNull();
	});

	test("Success when cover image already exists", async () => {
		mockResultExecFilePromise = "800/1000";
		mockProcess.argv[10] = "epub";
		mockIsBlobExist = true;
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? YES" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"puffin","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Cover image already exists - not creating" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when cover image already exists", async () => {
		mockResultExecFilePromise = "800/1000";
		mockProcess.argv[10] = "epub";
		mockIsBlobExist = true;
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? YES" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"puffin","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Cover image already exists - not creating" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Error when executing the command", async () => {
		mockProcess.argv[10] = "epub";
		mockExceError = "Something has gone wrong!";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(mockExceError);
	});

	test("Success when imprint as `puffin`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `puffin classics`;
		mockResultExecFilePromise = "800/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"puffin classics","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `puffin and cover image size as 1280/1024`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `puffin classics`;
		mockResultExecFilePromise = "1280/1024";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"puffin classics","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1280x1024)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `puffin and cover image size as 1080/1000`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `puffin classics`;
		mockResultExecFilePromise = "1080/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"puffin classics","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `penguin`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `penguin`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"penguin","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `penguin classics`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `penguin classics`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"penguin classics","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Throw Error when cover image aspect ratio is out of range and imprint is penguin classics", async () => {
		mockProcess.argv[10] = "epub";
		mockAssetMetaData.data.data.imprint = `penguin classics`;
		mockResultExecFilePromise = "200/2000";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error("[Publisher: penguin random house children's uk; Imprint: penguin classics; Cover Aspect: 0.1] [Cover image aspect not allowed]")
		);
	});

	test("Success when imprint as `bbc children's books`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `bbc children's books`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"bbc children's books","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `bbc children's books` and book cover image is 800/1000", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `bbc children's books`;
		mockResultExecFilePromise = "800/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"bbc children's books","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `bbc children's books` and book cover image is 1080/1000", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `bbc children's books`;
		mockResultExecFilePromise = "1080/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"bbc children's books","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `bbc children's books` and book cover image is 1280/1024", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `bbc children's books`;
		mockResultExecFilePromise = "1280/1024";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"bbc children's books","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1280x1024)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Throw Error when cover image aspect ratio is out of range and imprint is bbc children's books", async () => {
		mockProcess.argv[10] = "epub";
		mockAssetMetaData.data.data.imprint = `bbc children's books`;
		mockResultExecFilePromise = "200/2000";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error("[Publisher: penguin random house children's uk; Imprint: bbc children's books; Cover Aspect: 0.1] [Cover image aspect not allowed]")
		);
	});

	test("Success when imprint as `ladybird`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `ladybird` and book cover image is 800/1000", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "800/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `ladybird` and book cover image is 1080/1000", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "1080/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `ladybird` and book cover image is 1280/1024", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "1280/1024";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1280x1024)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Throw Error when cover image aspect ratio is out of range and imprint is ladybird", async () => {
		mockProcess.argv[10] = "epub";
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "200/2000";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error("[Publisher: penguin random house children's uk; Imprint: ladybird; Cover Aspect: 0.1] [Cover image aspect not allowed]")
		);
	});

	test("Success when imprint as `rhcp digital`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `rhcp digital`;
		mockResultExecFilePromise = "800/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"rhcp digital","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `rhcp digital` and book cover image is 1080/1000", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `rhcp digital`;
		mockResultExecFilePromise = "1080/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"rhcp digital","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `rhcp digital` and book cover image is 1280/1024", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `rhcp digital`;
		mockResultExecFilePromise = "1280/1024";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"rhcp digital","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1280x1024)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Throw Error when cover image aspect ratio is out of range and imprint is rhcp digital", async () => {
		mockProcess.argv[10] = "epub";
		mockAssetMetaData.data.data.imprint = `rhcp digital`;
		mockResultExecFilePromise = "200/2000";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error("[Publisher: penguin random house children's uk; Imprint: rhcp digital; Cover Aspect: 0.1] [Cover image aspect not allowed]")
		);
	});

	test("Success when imprint as `warne`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin random house children's uk`;
		mockAssetMetaData.data.data.imprint = `warne`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"warne","publisher":"penguin random house children's uk"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Throw Error when cover image aspect ratio is out of range and imprint is warne", async () => {
		mockProcess.argv[10] = "epub";
		mockAssetMetaData.data.data.imprint = `warne`;
		mockResultExecFilePromise = "200/2000";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error("[Publisher: penguin random house children's uk; Imprint: warne; Cover Aspect: 0.1] [Cover image aspect not allowed]")
		);
	});

	test("Throw Error when imprint not valid", async () => {
		mockAssetMetaData.data.data.imprint = `Test publisher`;
		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error("[Publisher: penguin random house children's uk; Imprint: test publisher; Cover Aspect: 0.75] [Unrecognised imprint]")
		);
	});

	test("Success when imprint as `franklin watts` and publisher as `hachette`", async () => {
		mockAssetMetaData.data.data.publisher = `hachette`;
		mockAssetMetaData.data.data.imprint = `franklin watts`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"franklin watts","publisher":"hachette"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when imprint as `wayland` and publisher as `hachette`", async () => {
		mockAssetMetaData.data.data.publisher = `hachette`;
		mockAssetMetaData.data.data.imprint = `wayland`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"wayland","publisher":"hachette"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Throw Error when imprint not valid when publisher is hachette", async () => {
		mockAssetMetaData.data.data.imprint = `Test publisher`;
		mockAssetMetaData.data.data.publisher = `hachette`;
		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(new Error("[Publisher: hachette; Imprint: test publisher; Cover Aspect: 0.75] [Unrecognised imprint]"));
	});

	test("Success when imprint as `penguin classics` and publisher as `penguin books ltd`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin books ltd`;
		mockAssetMetaData.data.data.imprint = `penguin classics`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"penguin classics","publisher":"penguin books ltd"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Throw Error when cover image aspect ratio is out of range and  publisher is `penguin books ltd` and imprint is `penguin classics`", async () => {
		mockAssetMetaData.data.data.publisher = `penguin books ltd`;
		mockAssetMetaData.data.data.imprint = `penguin classics`;
		mockProcess.argv[10] = "epub";
		mockResultExecFilePromise = "200/2000";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error("[Publisher: penguin books ltd; Imprint: penguin classics; Cover Aspect: 0.1] [Cover image aspect not allowed]")
		);
	});

	test("Throw Error when imprint not valid when publisher is penguin books ltd", async () => {
		mockAssetMetaData.data.data.imprint = `Test publisher`;
		mockAssetMetaData.data.data.publisher = `penguin books ltd`;
		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(new Error("[Publisher: penguin books ltd; Imprint: test publisher; Cover Aspect: 0.75] [Unrecognised imprint]"));
	});

	test("Success when publisher is faber & faber", async () => {
		mockAssetMetaData.data.data.publisher = `faber & faber`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"faber & faber"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when publisher is faber & faber and book cover image is 800/1000", async () => {
		mockAssetMetaData.data.data.publisher = `faber & faber`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "800/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"faber & faber"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when publisher is faber & faber and book cover image is 1080/1000", async () => {
		mockAssetMetaData.data.data.publisher = `faber & faber`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "1080/1000";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"faber & faber"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when publisher is faber & faber and book cover image is 1280/1024", async () => {
		mockAssetMetaData.data.data.publisher = `faber & faber`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "1280/1024";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"faber & faber"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1280x1024)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Throw Error when cover image aspect ratio is out of range and imprint is ladybird", async () => {
		mockProcess.argv[10] = "epub";
		mockAssetMetaData.data.data.publisher = `faber & faber`;
		mockResultExecFilePromise = "200/2000";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(new Error("[Publisher: faber & faber; Imprint: puffin; Cover Aspect: 0.1] [Cover image aspect not allowed]"));
	});

	test("Success when publisher is ivp", async () => {
		mockAssetMetaData.data.data.publisher = `ivp`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"ivp"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when publisher is crown house publishing", async () => {
		mockAssetMetaData.data.data.publisher = `crown house publishing`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"crown house publishing"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Success when publisher is harpercollins publishers", async () => {
		mockAssetMetaData.data.data.publisher = `harpercollins publishers`;
		mockAssetMetaData.data.data.imprint = `ladybird`;
		mockResultExecFilePromise = "1080/1500";

		mockProcess.argv[10] = "epub";
		const funResult = await workerLib();
		expect(funResult.error).toBeNull();
		expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
		expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
		expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
		expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
		expect(mockLogData).toContainObject({ content: "Finished waiting" });
		expect(mockLogData).toContainObject({
			content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ladybird","publisher":"harpercollins publishers"})`,
		});
		expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
		expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
		expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
		expect(mockLogData).toContainObject({ content: "Uploaded page count" });
		expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
		expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
		expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
		expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
		expect(mockLogData).toContainObject({ content: "Generated cover image" });
		expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
		expect(mockOutputs.pagecount.mode).toMatch("w");
		expect(mockOutputs.pagecount.output).toMatch("3");
		expect(stdoutOutput).toMatch("");
	});

	test("Throw Error when cover image aspect ratio is out of range when publisher is harpercollins publishers", async () => {
		mockProcess.argv[10] = "epub";
		mockAssetMetaData.data.data.publisher = `harpercollins publishers`;
		mockResultExecFilePromise = "200/2000";
		const funResult = await workerLib();
		expect(funResult.error).toEqual(
			new Error("[Publisher: harpercollins publishers; Imprint: puffin; Cover Aspect: 0.1] [Cover image aspect not allowed]")
		);
	});
});

test("Success when imprint as `bbc digital` and publisher as `random house`", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `bbc digital`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"bbc digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `bbc digital` and book cover image is 1080/1000", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `bbc digital`;
	mockResultExecFilePromise = "1080/1000";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"bbc digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `bbc digital` and book cover image is 800/1000", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `bbc digital`;
	mockResultExecFilePromise = "800/1000";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"bbc digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and imprint is bbc digital", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `bbc digital`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(new Error("[Publisher: random house; Imprint: bbc digital; Cover Aspect: 0.1] [Cover image aspect not allowed]"));
});

test("Success when imprint as `cornerstone digital` and publisher as `random house`", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `cornerstone digital`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"cornerstone digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and imprint is cornerstone digital", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `cornerstone digital`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(
		new Error("[Publisher: random house; Imprint: cornerstone digital; Cover Aspect: 0.1] [Cover image aspect not allowed]")
	);
});

test("Success when imprint as `ebury digital` and publisher as `random house`", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `ebury digital`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ebury digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `ebury digital` and book cover image is 1080/1000", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `ebury digital`;
	mockResultExecFilePromise = "1080/1000";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ebury digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `ebury digital` and book cover image is 800/1000", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `ebury digital`;
	mockResultExecFilePromise = "800/1000";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"ebury digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and imprint is ebury digital", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `ebury digital`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(new Error("[Publisher: random house; Imprint: ebury digital; Cover Aspect: 0.1] [Cover image aspect not allowed]"));
});

test("Success when imprint as `merky books digital` and publisher as `random house`", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `merky books digital`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"merky books digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and imprint is merky books digital", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `merky books digital`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(
		new Error("[Publisher: random house; Imprint: merky books digital; Cover Aspect: 0.1] [Cover image aspect not allowed]")
	);
});

test("Success when imprint as `preface digital` and publisher as `random house`", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `preface digital`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"preface digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and imprint is preface digital", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `preface digital`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(
		new Error("[Publisher: random house; Imprint: preface digital; Cover Aspect: 0.1] [Cover image aspect not allowed]")
	);
});

test("Success when imprint as `vintage digital` and publisher as `random house`", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `vintage digital`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"vintage digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `vintage digital` and book cover image is 1080/1000", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `vintage digital`;
	mockResultExecFilePromise = "1080/1000";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"vintage digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and imprint is vintage digital", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `vintage digital`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(
		new Error("[Publisher: random house; Imprint: vintage digital; Cover Aspect: 0.1] [Cover image aspect not allowed]")
	);
});

test("Success when imprint as `virgin digital` and publisher as `random house`", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `virgin digital`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"virgin digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `virgin digital` and book cover image is 1080/1000", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `virgin digital`;
	mockResultExecFilePromise = "1080/1000";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"virgin digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `virgin digital` and book cover image is 800/1000", async () => {
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `virgin digital`;
	mockResultExecFilePromise = "800/1000";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"virgin digital","publisher":"random house"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and imprint is virgin digital", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `random house`;
	mockAssetMetaData.data.data.imprint = `virgin digital`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(
		new Error("[Publisher: random house; Imprint: virgin digital; Cover Aspect: 0.1] [Cover image aspect not allowed]")
	);
});

test("Throw Error when imprint not valid when publisher is random house", async () => {
	mockAssetMetaData.data.data.imprint = `Test publisher`;
	mockAssetMetaData.data.data.publisher = `random house`;
	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(new Error("[Publisher: random house; Imprint: test publisher; Cover Aspect: 0.75] [Unrecognised imprint]"));
});

test("Success when imprint as `bloomsbury education` and publisher as `bloomsbury publishing`", async () => {
	mockAssetMetaData.data.data.publisher = `bloomsbury publishing`;
	mockAssetMetaData.data.data.imprint = `bloomsbury education`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"bloomsbury education","publisher":"bloomsbury publishing"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and imprint is bloomsbury education", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `bloomsbury publishing`;
	mockAssetMetaData.data.data.imprint = `bloomsbury education`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(
		new Error("[Publisher: bloomsbury publishing; Imprint: bloomsbury education; Cover Aspect: 0.1] [Cover image aspect not allowed]")
	);
});

test("Success when imprint as `methuen drama` and publisher as `bloomsbury publishing`", async () => {
	mockAssetMetaData.data.data.publisher = `bloomsbury publishing`;
	mockAssetMetaData.data.data.imprint = `methuen drama`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"methuen drama","publisher":"bloomsbury publishing"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `oberon books` and publisher as `bloomsbury publishing`", async () => {
	mockAssetMetaData.data.data.publisher = `bloomsbury publishing`;
	mockAssetMetaData.data.data.imprint = `oberon books`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"oberon books","publisher":"bloomsbury publishing"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `oberon books` and book cover image is 1080/1000", async () => {
	mockAssetMetaData.data.data.publisher = `bloomsbury publishing`;
	mockAssetMetaData.data.data.imprint = `oberon books`;
	mockResultExecFilePromise = "1080/1000";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"oberon books","publisher":"bloomsbury publishing"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1000)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Success when imprint as `oberon books` and book cover image is 800/1000", async () => {
	mockAssetMetaData.data.data.publisher = `bloomsbury publishing`;
	mockAssetMetaData.data.data.imprint = `oberon books`;
	mockResultExecFilePromise = "800/1000";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"oberon books","publisher":"bloomsbury publishing"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (800x1000)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and imprint is oberon books", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `bloomsbury publishing`;
	mockAssetMetaData.data.data.imprint = `oberon books`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(
		new Error("[Publisher: bloomsbury publishing; Imprint: oberon books; Cover Aspect: 0.1] [Cover image aspect not allowed]")
	);
});

test("Success when imprint as `the arden shakespeare` and publisher as `bloomsbury publishing`", async () => {
	mockAssetMetaData.data.data.publisher = `bloomsbury publishing`;
	mockAssetMetaData.data.data.imprint = `the arden shakespeare`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"the arden shakespeare","publisher":"bloomsbury publishing"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when imprint not valid when publisher is bloomsbury publishing", async () => {
	mockAssetMetaData.data.data.imprint = `Test publisher`;
	mockAssetMetaData.data.data.publisher = `bloomsbury publishing`;
	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(
		new Error("[Publisher: bloomsbury publishing; Imprint: test publisher; Cover Aspect: 0.75] [Unrecognised imprint]")
	);
});

test("Success when publisher as `thames and hudson`", async () => {
	mockAssetMetaData.data.data.publisher = `thames and hudson`;
	mockResultExecFilePromise = "1080/1500";

	mockProcess.argv[10] = "epub";
	const funResult = await workerLib();
	expect(funResult.error).toBeNull();
	expect(mockLogData).toContainObject({ content: "Downloaded ghostscript binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded magick binary" });
	expect(mockLogData).toContainObject({ content: "Downloaded epub asset" });
	expect(mockLogData).toContainObject({ content: "Checking whether cover image exists..." });
	expect(mockLogData).toContainObject({ content: "Cover image exists? NO" });
	expect(mockLogData).toContainObject({ content: "Finished waiting" });
	expect(mockLogData).toContainObject({
		content: `Fetched asset metadata ({"id":"1","isbn":"9876543210","title":"Asset title 1","imprint":"puffin","publisher":"thames and hudson"})`,
	});
	expect(mockLogData).toContainObject({ content: "Calculated cover image dimensions from EPUB (1080x1500)" });
	expect(mockLogData).toContainObject({ content: "Converted EPUB to PDF" });
	expect(mockLogData).toContainObject({ content: "Calculated page count (3)" });
	expect(mockLogData).toContainObject({ content: "Uploaded page count" });
	expect(mockLogData).toContainObject({ content: "Skipped generating high quality pages" });
	expect(mockLogData).toContainObject({ content: "Generated 3 page previews" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 0" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 1" });
	expect(mockLogData).toContainObject({ content: "Uploaded page preview 2" });
	expect(mockLogData).toContainObject({ content: "Uploaded ALL page previews" });
	expect(mockLogData).toContainObject({ content: "Generated cover image" });
	expect(mockLogData).toContainObject({ content: "Uploaded cover image - exiting successfully" });
	expect(mockOutputs.pagecount.mode).toMatch("w");
	expect(mockOutputs.pagecount.output).toMatch("3");
	expect(stdoutOutput).toMatch("");
});

test("Throw Error when cover image aspect ratio is out of range and publisher is thames and hudson", async () => {
	mockProcess.argv[10] = "epub";
	mockAssetMetaData.data.data.publisher = `thames and hudson`;
	mockAssetMetaData.data.data.imprint = `puffin`;
	mockResultExecFilePromise = "200/2000";
	const funResult = await workerLib();
	expect(funResult.error).toEqual(new Error("[Publisher: thames and hudson; Imprint: puffin; Cover Aspect: 0.1] [Cover image aspect not allowed]"));
});
