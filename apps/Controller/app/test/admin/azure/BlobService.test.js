const BlobService = require("../../../core/admin/azure/BlobService");
const BlobResource = require("../../../core/admin/azure/BlobResource");

let mockBlobClient;
let mockBlockBlobClient;
let mockContainerClient;

let mockDeleteIfExists = () => {};
let mockListBlobsFlat = () => [];
let mockListBlobsByHierarchy = () => [];
let mockGenerateAccountSASQueryParameters = () => "abc";

let mockBlobClientMethods = {};
let mockBlockBlobClientMethods = {};
let mockUrl;

jest.mock("@azure/storage-blob", () => {
	const client = {
		getContainerClient(...args) {
			return new mockContainerClient(...args);
		},
		credential: "XYZ",
	};

	return {
		BlobServiceClient: {
			fromConnectionString() {
				return client;
			},
		},
		generateAccountSASQueryParameters(...args) {
			return mockGenerateAccountSASQueryParameters(...args);
		},
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockBlobClientMethods.exists = () => {};
	mockBlobClientMethods.downloadToFile = () => {};
	mockBlobClientMethods.deleteIfExists = () => {};

	mockBlockBlobClientMethods.uploadFile = () => {};
	mockBlockBlobClientMethods.uploadData = () => {};

	mockUrl = "http://mock.com";

	mockContainerClient = class {
		constructor(...args) {
			this._args = [...args];
		}
		getBlobClient(...args) {
			return new mockBlobClient(...args);
		}
		getBlockBlobClient(...args) {
			return new mockBlockBlobClient(...args);
		}
		deleteIfExists(...args) {
			return mockDeleteIfExists(...args);
		}
		listBlobsFlat(...args) {
			return mockListBlobsFlat(...args);
		}
		listBlobsByHierarchy(...args) {
			return mockListBlobsByHierarchy(...args);
		}
	};

	mockBlobClient = class {
		constructor(file) {
			this._file = file;
			this.url = mockUrl;
		}
		exists(...args) {
			return mockBlobClientMethods.exists(...args);
		}
		downloadToFile(...args) {
			return mockBlobClientMethods.downloadToFile(...args);
		}
		deleteIfExists(...args) {
			return mockBlobClientMethods.deleteIfExists(...args);
		}
	};

	mockBlockBlobClient = class {
		constructor(...args) {
			this._args = [...args];
		}
		uploadFile(...args) {
			return mockBlockBlobClientMethods.uploadFile(...args);
		}
		uploadData(...args) {
			return mockBlockBlobClientMethods.uploadData(...args);
		}
	};

	mockGenerateAccountSASQueryParameters = () => "abc";
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

describe("doesBlobExist", () => {
	test("false", async () => {
		mockBlobClientMethods.exists = () => {
			return false;
		};
		const blobService = new BlobService("a", "b", "c", "d");
		const res = await blobService.doesBlobExist(new BlobResource("X", "Y"));
		expect(res).toEqual(false);
	});
	test("true", async () => {
		mockBlobClientMethods.exists = () => {
			return true;
		};
		const blobService = new BlobService("a", "b", "c", "d");
		const res = await blobService.doesBlobExist(new BlobResource("X", "Y"));
		expect(res).toEqual(true);
	});
});

describe("uploadFile", () => {
	test("A", async () => {
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = await blobService.uploadFile("abc", new BlobResource("XX", "YY"), {});
		expect(ret).toBeUndefined();
	});
});

describe("uploadBuffer", () => {
	test("A", async () => {
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = await blobService.uploadBuffer(Buffer.from("abc"), new BlobResource("XX", "YY"), {});
		expect(ret).toBeUndefined();
	});
});

describe("downloadBlob", () => {
	test("A", async () => {
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = await blobService.downloadBlob(new BlobResource("XX", "YY"), "abc");
		expect(ret).toBeUndefined();
	});
});

describe("deleteBlob", () => {
	test("A", async () => {
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = await blobService.deleteBlob(new BlobResource("XX", "YY"));
		expect(ret).toBeUndefined();
	});
});

describe("deleteContainer", () => {
	test("A", async () => {
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = await blobService.deleteContainer("AAA");
		expect(ret).toBeUndefined();
	});
});

describe("getAllBlobsInContainer", () => {
	test("A", async () => {
		mockListBlobsFlat = () => ["x", "y", "z"];
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = await blobService.getAllBlobsInContainer("AAA");
		expect(ret).toEqual(["x", "y", "z"]);
	});
});

describe("getAllDirectoriesInContainer", () => {
	test("A", async () => {
		mockListBlobsByHierarchy = () => [
			{
				kind: "prefix",
				path: "x",
			},
			{
				kind: "prefix",
				path: "y",
			},
		];
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = await blobService.getAllDirectoriesInContainer("AAA");
		expect(ret).toEqual([
			{
				kind: "prefix",
				path: "x",
			},
			{
				kind: "prefix",
				path: "y",
			},
		]);
	});
});

describe("generateSasToken", () => {
	test("with ip", async () => {
		mockGenerateAccountSASQueryParameters = (sap) => {
			if (sap.ipRange) {
				return "withip=1&perm=" + sap.permissions;
			}
			return "noip=1&perm=" + sap.permissions;
		};
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = blobService.generateSasToken(new BlobResource("AA", "BB"), "rw", "1.2.3.4", 180);
		expect(ret).toEqual({
			token: "withip=1&perm=rw",
			uri: "http://mock.com?withip=1&perm=rw",
		});
	});
	test("no ip", async () => {
		mockGenerateAccountSASQueryParameters = (sap) => {
			if (sap.ipRange) {
				return "withip=1&perm=" + sap.permissions;
			}
			return "noip=1&perm=" + sap.permissions;
		};
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = blobService.generateSasToken(new BlobResource("AA", "BB"));
		expect(ret).toEqual({
			token: "noip=1&perm=r",
			uri: "http://mock.com?noip=1&perm=r",
		});
	});
	test("url with query param", async () => {
		mockUrl = "http://foo.bar?hello=there";
		mockGenerateAccountSASQueryParameters = (sap) => {
			return "noip=1&perm=" + sap.permissions;
		};
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = blobService.generateSasToken(new BlobResource("AA", "BB"));
		expect(ret).toEqual({
			token: "noip=1&perm=r",
			uri: "http://foo.bar?hello=there&noip=1&perm=r",
		});
	});
	test("container access only", async () => {
		mockGenerateAccountSASQueryParameters = (sap) => {
			return "perm=" + sap.permissions + "&rt=" + sap.resourceTypes;
		};
		const blobService = new BlobService("a", "b", "c", "d");
		const ret = blobService.generateSasToken(new BlobResource("AA"));
		expect(ret).toEqual({
			token: "perm=r&rt=co",
			uri: "http://mock.com?perm=r&rt=co",
		});
	});
});
