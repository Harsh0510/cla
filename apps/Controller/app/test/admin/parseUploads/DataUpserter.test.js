const DataUpserter = require("../../../core/admin/parseUploads/DataUpserter");

const defaultDatabaseQuerier = {};
defaultDatabaseQuerier.connect = function () {
	return {
		query: function () {
			return new Promise((resolve, reject) => {
				resolve(null);
			});
		},
	};
};

describe("general set/get", () => {
	test("setting database querier works", async () => {
		const upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
		expect(upserter.databaseQuerier).toBe(defaultDatabaseQuerier);
	});
	test("author hashing", async () => {
		const upserter = new DataUpserter();
		expect(
			upserter._getAuthorHash({
				firstName: "bob",
				lastName: "smith",
			})
		).toBe("bob@@smith");
	});
});

describe("handling publishers", () => {
	const dbClient = Object.create(null);
	let mockIsIncludeDateEditedOnConflictInPublisher = false;
	dbClient.query = function (query, values) {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("INSERT INTO publisher") !== -1) {
			if (query.indexOf("ON CONFLICT (name) DO UPDATE") !== -1) {
				mockIsIncludeDateEditedOnConflictInPublisher = query.indexOf("date_edited") !== -1 ? true : false;
			}
			return new Promise((resolve, reject) => {
				const ret = {
					rows: [],
				};
				let counter = 0;
				for (const publisherName of values) {
					ret.rows.push({
						id: ++counter,
						name: publisherName,
					});
				}
				resolve(ret);
			});
		}
	};

	let upserter;
	beforeEach(function () {
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
		mockIsIncludeDateEditedOnConflictInPublisher = false;
	});
	test("single product", async () => {
		const product = {
			publisher: "pub1",
		};
		expect(await upserter._handlePublisher(dbClient, product)).toEqual(1);
	});

	test("Ensure when conflict occurs, date_edited is updated successfully in database", async () => {
		const product = {
			publisher: "pub1",
		};
		expect(await upserter._handlePublisher(dbClient, product)).toEqual(1);
		expect(mockIsIncludeDateEditedOnConflictInPublisher).toBe(true);
	});
});

describe("handling imprint", () => {
	const publisherId = 1;
	let mockIsIncludeDateEditedOnConflictInImprint = false;
	const dbClient = Object.create(null);
	dbClient.query = function (query, values) {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("INSERT INTO imprint") !== -1) {
			if (query.indexOf("ON CONFLICT (name) DO UPDATE") !== -1) {
				mockIsIncludeDateEditedOnConflictInImprint = query.indexOf("date_edited") !== -1 ? true : false;
			}
			return new Promise((resolve, reject) => {
				const ret = {
					rows: [{ id: 1 }],
				};
				let counter = 0;
				for (const publisherName of values) {
					ret.rows.push({
						id: ++counter,
						name: publisherName,
					});
				}
				resolve(ret);
			});
		}
	};

	let upserter;
	beforeEach(function () {
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
		mockIsIncludeDateEditedOnConflictInImprint = false;
	});
	test("single product", async () => {
		const product = {
			imprint: "imprint1",
			publisher: "publisher 1",
		};
		expect(await upserter._handleImprint(dbClient, product, publisherId)).toEqual(1);
	});

	test("Getting the 0 When no data pass", async () => {
		const product = {};
		expect(await upserter._handleImprint(dbClient, product, publisherId)).toEqual(0);
	});

	test("Ensure when conflict occurs, date_edited is updated successfully in database", async () => {
		const product = {
			imprint: "imprint1",
			publisher: "publisher 1",
		};
		expect(await upserter._handleImprint(dbClient, product, publisherId)).toEqual(1);
		expect(mockIsIncludeDateEditedOnConflictInImprint).toBe(true);
	});
});

describe("handling asset subjects", () => {
	const mock_AssetId = 1;
	const dbClient = Object.create(null);
	dbClient.query = function (query, values) {
		return new Promise((resolve, reject) => {
			const ret = {
				rows: [{ id: 1 }],
			};
			let counter = 0;
			for (const publisherName of values) {
				ret.rows.push({
					id: ++counter,
					name: publisherName,
				});
			}
			resolve(ret);
		});
	};

	let upserter;
	beforeEach(function () {
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
	});
	test("single product", async () => {
		const product = {
			subjects: ["subjects 1", "subjects 2"],
		};
		expect(await upserter._handleAssetSubjects(dbClient, product, mock_AssetId)).toBe(undefined);
	});

	test("Getting the null When subjects as blank array", async () => {
		const product = {
			subjects: [],
		};
		expect(await upserter._handleAssetSubjects(dbClient, product, mock_AssetId)).toEqual(null);
	});
});

describe("handling authors", () => {
	const mock_AssetId = 1;
	let mockIsIncludeDateEditedOnConflictInAuthor = false;
	let mockIsIncludeDateEditedOnConflictInAssetAuthor = false;
	const dbClient = Object.create(null);
	dbClient.query = function (query, binds) {
		query = query.trim().replace(/\s+/g, " ");

		return new Promise((resolve, reject) => {
			const ret = {
				rows: [],
			};
			if (query.indexOf("INSERT INTO author ") !== -1) {
				let counter = 0;
				if (binds && binds.length) {
					for (let i = 0, len = binds.length; i < len; i += 2) {
						ret.rows.push({ id: ++counter, first_name: binds[i], last_name: binds[i + 1] });
					}
				}
				if (query.indexOf("ON CONFLICT (first_name, last_name) DO UPDATE") !== -1) {
					mockIsIncludeDateEditedOnConflictInAuthor = query.indexOf("date_edited") !== -1 ? true : false;
				}
			}
			if (query.indexOf("INSERT INTO asset_authors") !== -1) {
				let counter = 0;
				if (binds && binds.length) {
					for (let i = 0, len = binds.length; i < len; i++) {
						ret.rows.push({ id: ++counter, result: binds[i] });
					}
				}
				if (query.indexOf("ON CONFLICT (asset_id, author_id, role_code) DO UPDATE") !== -1) {
					mockIsIncludeDateEditedOnConflictInAssetAuthor = query.indexOf("date_edited") !== -1 ? true : false;
				}
			}
			resolve(ret);
		});
	};

	let upserter;
	beforeEach(function () {
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
		mockIsIncludeDateEditedOnConflictInAuthor = false;
		mockIsIncludeDateEditedOnConflictInAssetAuthor = false;
	});
	test("single product + single author", async () => {
		const assetId = 1;
		const product = {
			authors: [{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` }],
		};
		expect(await upserter._handleAuthors(dbClient, product, assetId)).toEqual(undefined);
	});

	test("single product + many authors", async () => {
		const data = {
			authors: [
				{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` },
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `2` },
			],
		};
		expect(await upserter._handleAuthors(dbClient, data)).toEqual(undefined);
	});

	test("Getting the null When authors as blank array", async () => {
		const product = {
			authors: [],
		};
		expect(await upserter._handleAuthors(dbClient, product, mock_AssetId)).toEqual(null);
	});

	test("Getting the dupicate values in authors", async () => {
		const product = {
			authors: [
				{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` },
				{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` },
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `2` },
			],
		};
		expect(await upserter._handleAuthors(dbClient, product, mock_AssetId)).toEqual(undefined);
	});

	test("Ensure when conflict occurs, date_edited is updated successfully in database", async () => {
		const assetId = 1;
		const product = {
			authors: [{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` }],
		};
		expect(await upserter._handleAuthors(dbClient, product, assetId)).toEqual(undefined);
		expect(mockIsIncludeDateEditedOnConflictInAuthor).toBe(true);
		expect(mockIsIncludeDateEditedOnConflictInAssetAuthor).toBe(true);
	});
});

describe("insert asset groups", () => {
	const inserted = [];
	const dbClient = Object.create(null);
	dbClient.query = function (query, values) {
		inserted.push(values);
		query = query.trim().replace(/\s+/g, " ");
		return new Promise((resolve, reject) => {
			if (query.indexOf("INSERT INTO asset_group (") < 0) {
				throw "should never be here";
			}
			resolve({
				rows: [
					{
						id: 12345,
					},
				],
			});
		});
	};
	let upserter;
	beforeEach(function () {
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
	});
	test("single product", async () => {
		const data = {
			parentAsset: {
				identifier: "XYZ",
				title: "ABC",
			},
			publisher: "pub",
			contentForm: "MI",
		};
		expect(await upserter._insertAssetGroup(dbClient, data, 111)).toEqual(12345);
		expect(inserted).toEqual([["XYZ", "ABC", 111, "pub"]]);
	});
});

describe("insert assets", () => {
	let mockAssetAvailable = true;
	let mockIsIncludeDateEdited;
	const mockData = {
		publisherId: 1,
		imprintId: 1,
		active: true,
		assetGroupId: 3,
	};

	const dbClient = Object.create(null);
	dbClient.query = function (query, values) {
		query = query.trim().replace(/\s+/g, " ");
		return new Promise((resolve, reject) => {
			const ret = {
				rows: [],
			};
			if (query.indexOf("FROM asset") !== -1) {
				if (mockAssetAvailable) {
					ret.rows.push({ id: 1, isbn13: "g" });
				}
			}
			resolve(ret);
		});
	};
	let upserter;
	beforeEach(function () {
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
		mockIsIncludeDateEdited = false;
	});
	test("single product", async () => {
		const data = {
			title: "a",
			extent: "b",
			recordReference: "c",
			toc: "d",
			publicationDate: 123456789,
			pdfFile: "f",
			isbn13: "g",
			subjects: ["h", "a"],
			publisher: "pub",
			copyExcludedPages: [1, 2, 3],
			authors: [
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Tristy", lastName: "malino", roleCode: "B", sequenceNumber: `2` },
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` },
			],
		};
		expect(await upserter._insertAsset(dbClient, data, mockData.publisherId, mockData.imprintId, mockData.assetGroupId, true)).toEqual(1);
	});

	test("single product with parentAsset identifier", async () => {
		const data = {
			title: "a",
			extent: "b",
			recordReference: "c",
			toc: "d",
			publicationDate: 123456789,
			pdfFile: "f",
			isbn13: "g",
			subjects: ["h", "a"],
			publisher: "pub",
			copyExcludedPages: [1, 2, 3],
			authors: [
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Tristy", lastName: "malino", roleCode: "B", sequenceNumber: `2` },
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` },
			],
			parentAsset: {
				identifier: "ID1",
			},
		};
		expect(await upserter._insertAsset(dbClient, data, mockData.publisherId, mockData.imprintId, mockData.assetGroupId, true)).toEqual(1);
	});

	test("single product with product contentForm is MI", async () => {
		const toc = [
			{ label: "a", description: "dq" },
			{ label: "a1", description: "dq1" },
		];
		const data = {
			title: "a",
			extent: "b",
			recordReference: "c",
			toc: toc,
			publicationDate: 123456789,
			pdfFile: "f",
			isbn13: "g",
			subjects: ["h", "a"],
			publisher: "pub",
			copyExcludedPages: [1, 2, 3],
			authors: [
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Tristy", lastName: "malino", roleCode: "B", sequenceNumber: `2` },
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` },
			],
			parentAsset: {
				identifier: "ID1",
			},
			contentForm: "MI",
		};
		expect(await upserter._insertAsset(dbClient, data, mockData.publisherId, mockData.imprintId, mockData.assetGroupId, toc)).toEqual(1);
	});

	test("single product with product publicationDate is null", async () => {
		const toc = [
			{ label: "a", description: "dq" },
			{ label: "a1", description: "dq1" },
		];
		const data = {
			title: "a",
			extent: "b",
			recordReference: "c",
			toc: toc,
			publicationDate: null,
			pdfFile: "f",
			isbn13: "g",
			subjects: ["h", "a"],
			publisher: "pub",
			copyExcludedPages: [1, 2, 3],
			authors: [
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Tristy", lastName: "malino", roleCode: "B", sequenceNumber: `2` },
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` },
			],
			parentAsset: {
				identifier: "ID1",
			},
			contentForm: "MI",
		};
		expect(await upserter._insertAsset(dbClient, data, mockData.publisherId, mockData.imprintId, mockData.assetGroupId, toc)).toEqual(1);
	});

	test("Ensure date_edited updated successfully in database", async () => {
		const data = {
			title: "a",
			extent: "b",
			recordReference: "c",
			toc: "d",
			publicationDate: 123456789,
			pdfFile: "f",
			isbn13: "g",
			subjects: ["h", "a"],
			publisher: "pub",
			copyExcludedPages: [1, 2, 3],
			authors: [
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Tristy", lastName: "malino", roleCode: "B", sequenceNumber: `2` },
				{ firstName: "Jane", lastName: "Doe", roleCode: "B", sequenceNumber: `5` },
				{ firstName: "Bob", lastName: "Smith", roleCode: "A", sequenceNumber: `1` },
			],
		};

		dbClient.query = function (query, values) {
			query = query.trim().replace(/\s+/g, " ");
			return new Promise((resolve, reject) => {
				const ret = {
					rows: [],
				};
				if (query.indexOf("FROM asset") !== -1) {
					if (mockAssetAvailable) {
						ret.rows.push({ id: 1, isbn13: "g" });
					}
				}
				if (query.indexOf("UPDATE asset SET") !== -1) {
					mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
				}
				resolve(ret);
			});
		};

		expect(await upserter._insertAsset(dbClient, data, mockData.publisherId, mockData.imprintId, mockData.assetGroupId, true)).toEqual(1);
		expect(mockIsIncludeDateEdited).toBe(true);
	});
});

describe("insert Filters Ex", () => {
	let mockAssetId = 1;

	const dbClient = Object.create(null);
	dbClient.query = function (query, values) {
		query = query.trim().replace(/\s+/g, " ");
		return new Promise((resolve, reject) => {
			const ret = {
				rows: [],
			};
			resolve(ret);
		});
	};
	let upserter;
	beforeEach(function () {
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
	});
	test("insert filter with single filter value", async () => {
		expect(await upserter._insertFiltersEx(dbClient, "exam", ["Test Exam"], mockAssetId)).toEqual(undefined);
	});

	test("insert filter with null filter value", async () => {
		expect(await upserter._insertFiltersEx(dbClient, "exam", [], mockAssetId)).toEqual(undefined);
	});
});

describe("auto Unlock Asset", () => {
	let mockReturnSchool = true;
	let mockIsIncludeDateEditedOnConflictInAssetSchoolInfo = false;

	const dbClient = Object.create(null);
	dbClient.query = function (query, values) {
		query = query.trim().replace(/\s+/g, " ");
		return new Promise((resolve, reject) => {
			const ret = {
				rows: [],
			};
			if (query.indexOf("SELECT school_id") !== -1) {
				if (mockReturnSchool) {
					ret.rows.push({ school_id: 1, event: "user-camera" });
					ret.rows.push({ school_id: 2, event: "user-camera" });
					ret.rows.push({ school_id: 3, event: "temp-unlock" });
					ret.rows.push({ school_id: 2, event: "temp-unlock" });
				}
			}
			if (query.indexOf("INSERT INTO asset_school_info") !== -1) {
				if (query.indexOf("ON CONFLICT (school_id, asset_id) DO UPDATE") !== -1) {
					mockIsIncludeDateEditedOnConflictInAssetSchoolInfo = query.indexOf("date_edited") !== -1 ? true : false;
				}
			}
			resolve(ret);
		});
	};
	let upserter;
	beforeEach(function () {
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
		mockIsIncludeDateEditedOnConflictInAssetSchoolInfo = false;
	});
	test("Auto unlock asset if asset found with school", async () => {
		mockReturnSchool = true;
		expect(await upserter._autoUnlockAsset(dbClient, 1, "9000000000001", "9000000000001")).toEqual(undefined);
	});

	test("Auto unlock asset if asset found with school with temp-unlock status", async () => {
		mockReturnSchool = false;
		expect(await upserter._autoUnlockAsset(dbClient, 1, "9000000000001", "9000000000001")).toEqual(undefined);
	});

	test("Ensure when conflict occurs, date_edited is updated successfully in database", async () => {
		mockReturnSchool = true;
		expect(await upserter._autoUnlockAsset(dbClient, 1, "9000000000001", "9000000000001")).toEqual(undefined);
		expect(mockIsIncludeDateEditedOnConflictInAssetSchoolInfo).toBe(true);
	});
});

describe("upsert", () => {
	function defaultQuerierInnards(query, binds, resolve, reject) {
		const ret = {
			rows: [],
		};

		if (query) {
			const text = query.replace(/[\s\t\n\r]+/g, " ").trim();
			if (text.indexOf("FROM asset") !== -1) {
				ret.rows = [];
				resolve(ret);
				return;
			}
			if (text.indexOf("INSERT INTO asset ") === 0) {
				ret.rows.push({
					id: 1,
				});
				resolve(ret);
				return;
			}
			if (text.indexOf("INSERT INTO publisher ") === 0) {
				let counter = 0;
				for (const publisherName of binds) {
					ret.rows.push({
						id: ++counter,
						name: publisherName,
					});
				}
				resolve(ret);
				return;
			}
			if (text.indexOf("INSERT INTO imprint ") === 0) {
				let counter = 0;
				for (const imprint of binds) {
					ret.rows.push({
						id: ++counter,
					});
				}
				resolve(ret);
				return;
			}
			if (text.indexOf("INSERT INTO author ") !== -1) {
				let counter = 0;
				if (binds && binds.length) {
					for (let i = 0, len = binds.length; i < len; i += 2) {
						ret.rows.push({ id: ++counter, first_name: binds[i], last_name: binds[i + 1] });
					}
				}
				resolve(ret);
				return;
			}
			if (text.indexOf("INSERT INTO asset_authors") !== -1) {
				let counter = 0;
				if (binds && binds.length) {
					for (let i = 0, len = binds.length; i < len; i++) {
						ret.rows.push({ id: ++counter, result: binds[i] });
					}
				}
				resolve(ret);
				return;
			}
			if (text.indexOf("INSERT INTO asset_subject ") === 0) {
				ret.rows = [];
				resolve(ret);
				return;
			}
			if (text.indexOf("SELECT school_id, event FROM unlock_attempt") === 0) {
				ret.rows.push({
					school_id: 3,
					event: "user-camera",
				});
				resolve(ret);
				return;
			}
			if (text.indexOf("INSERT INTO asset_school_info") === 0) {
				ret.rows = [];
				resolve(ret);
				return;
			}
		}
		resolve();
	}

	function defaultQuerier(config) {
		return new Promise((resolve, reject) => {
			defaultQuerierInnards(config, resolve, reject);
		});
	}
	let releaserCallCount;
	function defaultReleaser() {
		releaserCallCount++;
	}

	function getProductData() {
		return {
			errors: [],
			title: "a",
			subTitle: "b sub title",
			description: "description ",
			edition: 2,
			page_count: 15,
			extent_page_count: 16,
			extent: "b",
			record_reference: "c",
			table_of_contents: "",
			toc: "d",
			publicationDate: 123456789,
			pdfFile: "f",
			isbn13: "g",
			pdf_isbn13: "g",
			subjects: ["h", "b"],
			publisher: "pub",
			publisher_name_log: "test ",
			authors: [
				{ firstName: "Jenny", lastName: "Smith", roleCode: "A", sequenceNumber: 1 },
				{ firstName: "Jenny 2", lastName: "Smith 2", roleCode: "B", sequenceNumber: 2 },
			],
			language: ["eng"],
			rightsPermitted: ["RS"],
			rightsNotPermitted: [],
			imprint: "Jenny Smith",
			educationalYearGroup: ["y12"],
			exam: ["primary"],
			examBoard: ["EBC"],
			keyStage: ["KS1"],
			level: ["primary"],
			scottishLevel: ["scottishLevel1", "scottishLevel2"],
			collection: ["collection1", "collection2"],
		};
	}

	const dbClient = Object.create(null);

	beforeEach(function () {
		releaserCallCount = 0;
		dbClient.query = defaultQuerier;
		dbClient.release = defaultReleaser;
	});

	const databaseQuerier = {};
	databaseQuerier.connect = function () {
		return new Promise((resolve, reject) => {
			resolve(dbClient);
		});
	};

	test("no products", async () => {
		const upserter = new DataUpserter();
		upserter.setDatabaseQuerier(databaseQuerier);
		expect(await upserter.upsert(null)).toBe(null);
	});

	test("connecting fails", async () => {
		const databaseQuerierFail = {};
		databaseQuerierFail.connect = function () {
			return new Promise((resolve, reject) => {
				reject("FAIL");
			});
		};

		const upserter = new DataUpserter();
		upserter.setDatabaseQuerier(databaseQuerierFail);

		const data = {
			errors: [],
			products: {
				errors: [],
				title: "the title",
			},
		};

		let lastError;
		let results;
		try {
			results = await upserter.upsert(data.products);
		} catch (e) {
			lastError = e;
		}

		expect(lastError).toBe("FAIL");
	});

	test("beginning transaction fails", async () => {
		dbClient.query = function (text) {
			return new Promise((resolve, reject) => {
				if (text === "BEGIN") {
					reject("it failed");
				} else {
					resolve({ rows: [] });
				}
			});
		};

		const upserter = new DataUpserter();
		upserter.setDatabaseQuerier(databaseQuerier);

		let lastError;
		let results;
		try {
			results = await upserter.upsert(getProductData());
		} catch (e) {
			lastError = e;
		}

		expect(lastError).toBe("it failed");
		expect(releaserCallCount).toBe(1);
	});

	test("committing transaction fails", async () => {
		dbClient.query = function (text, binds) {
			return new Promise((resolve, reject) => {
				if (text === "COMMIT") {
					reject("failed again");
				} else {
					defaultQuerierInnards(text, binds, resolve, reject);
				}
			});
		};

		const upserter = new DataUpserter();
		upserter.setDatabaseQuerier(databaseQuerier);

		let lastError;
		let results;
		try {
			results = await upserter.upsert(getProductData());
		} catch (e) {
			lastError = e;
		}

		expect(lastError).toBe("failed again");
		expect(releaserCallCount).toBe(1);
	});

	test("all successful", async () => {
		dbClient.query = function (text, binds) {
			return new Promise((resolve, reject) => {
				if (text === "COMMIT") {
					resolve();
				} else {
					defaultQuerierInnards(text, binds, resolve, reject);
				}
			});
		};

		const upserter = new DataUpserter();
		upserter.setDatabaseQuerier(databaseQuerier);

		let lastError;
		let results;
		try {
			results = await upserter.upsert(getProductData());
		} catch (e) {
			lastError = e;
		}

		expect(lastError).toBeUndefined();
		expect(releaserCallCount).toBe(1);
		expect(results).toEqual(1);
	});
});

describe("TOC parsing", () => {
	let du;
	beforeEach(() => {
		du = new DataUpserter();
	});
	test("Nullish TOC", async () => {
		const res = du._parseTableOfContents(null);
		expect(res).toEqual(null);
	});
	test("Malformed TOC", async () => {
		const res = du._parseTableOfContents(3456);
		expect(res).toEqual(null);
	});
	test("No found TOC items", async () => {
		const res = du._parseTableOfContents(`<ul><li>Nothing found!</li></ul>`);
		expect(res).toEqual([]);
	});
	test("Successful parse", async () => {
		const res = du._parseTableOfContents(`<ul>
			<li>Nothing here</li>
			<li>
				<span class="label">Item 1</span>
				<span class="page">10</span>
			</li>
			<li>
				<span class="label">Item 2</span>
				<span class="label">Item 2</span>
				<span class="page">20</span>
			</li>
			<li>
				<span class="label">Item 3</span>
				<span class="page">30</span>
				<span class="page">5</span>
			</li>
			<li>
				<span class="label">Item 4</span>
				<span class="page">abc</span>
			</li>
			<li>
				<span class="label">Item 5</span>
				<span class="page">-123</span>
			</li>
			<li>
				<span class="label"></span>
				<span class="page">123</span>
			</li>
			<li>
				<span class="label">Item 7</span>
				<span class="page"></span>
			</li>
			<li>
				<span class="label">


				</span>
				<span class="page"></span>
			</li>
			<li>
				<span class="label">Item 9</span>
				<span class="page">

				</span>
			</li>
			<li>
				<span class="label" title="   This is a    description  ">Item 10</span>
				<span class="page">100</span>
			</li>
		</ul>`);
		expect(res).toEqual([
			{
				label: "Item 1",
				description: null,
				page: 10,
			},
			{
				label: "Item 10",
				description: "This is a description",
				page: 100,
			},
		]);
	});
});

describe("Update asset", () => {
	let upserter;
	let isIncludeDateEditedTimes = 0;
	beforeEach(function () {
		defaultDatabaseQuerier.query = function () {
			return {
				query: function () {
					return new Promise((resolve, reject) => {
						resolve(null);
					});
				},
			};
		};
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
		isIncludeDateEditedTimes = 0;
	});
	const dbClient = Object.create(null);
	dbClient.query = function (query, values) {
		query = query.trim().replace(/\s+/g, " ");
		return new Promise((resolve, reject) => {
			if (query.indexOf("UPDATE asset SET") < 0) {
				throw "should never be here";
			}
			resolve({});
		});
	};

	test("update epub", async () => {
		const data = [
			{
				pdfIsbn13: "pdfIsbn13",
				contentForm: "epub",
				pageCount: 2,
			},
		];
		expect(await upserter.updateAssets(data)).toEqual();
	});

	test("Ensure date_edited updated successfully in database", async () => {
		defaultDatabaseQuerier.query = function (query, values) {
			query = query.trim().replace(/\s+/g, " ");
			return new Promise((resolve, reject) => {
				if (query.indexOf("UPDATE asset SET") !== -1) {
					query.indexOf("date_edited") !== -1 ? isIncludeDateEditedTimes++ : null;
				}
				resolve(null);
			});
		};
		const data = [
			{
				pdfIsbn13: "pdfIsbn13",
				contentForm: "epub",
				pageCount: 2,
			},
		];
		expect(await upserter.updateAssets(data)).toEqual();
		expect(isIncludeDateEditedTimes).toEqual(2);
	});
});

// delete filters that aren't associated with any assets
describe("upsertAssetFragments", () => {
	let count = 0;
	let upserter;
	let mockProduct;
	const dbClient = Object.create(null);
	beforeEach(function () {
		mockProduct = {
			toc: "d",
			contentForm: "MI",
		};
		count = 0;
		dbClient.query = function (query, binds) {
			return new Promise((resolve, reject) => {
				if (query.indexOf("DELETE") !== -1) {
					count = count + 1;
				} else if (query.indexOf("INSERT INTO") !== -1) {
					count = count + 1;
				}
				resolve(true);
			});
		};
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
	});

	test("all successful when product toc null and contentForm is Mi", async () => {
		count = 0;
		let lastError;
		let results;
		try {
			mockProduct.toc = null;
			mockProduct.contentForm = "MI";
			results = await upserter._upsertAssetFragments(dbClient, mockProduct, "1", null);
		} catch (e) {
			lastError = e;
		}
		expect(results).toBeUndefined();
		expect(lastError).toBeUndefined();
		expect(count).toBe(0);
	});

	test("all successful when product have toc and contentForm is Mi", async () => {
		count = 0;
		let lastError;
		let results;
		try {
			mockProduct.toc =
				'<ul><li><span class="label">Pure</span><span class="page"></span></li><li> <span class="label">Index laws</span><span class="page">1</span> </li></ul>';
			mockProduct.contentForm = "MI";
			const toc = [{ label: "Index laws", description: null, page: 1 }];
			results = await upserter._upsertAssetFragments(dbClient, mockProduct, "1", toc);
		} catch (e) {
			lastError = e;
		}
		expect(results).toBeUndefined();
		expect(lastError).toBeUndefined();
		expect(count).toEqual(2);
	});
});

// delete filters that aren't associated with any assets
describe("Delete orphaned records", () => {
	let count = 0;
	let upserter;
	beforeEach(function () {
		count = 0;
		defaultDatabaseQuerier.connect = function () {
			return {
				query: function (query) {
					return new Promise((resolve, reject) => {
						if (query.indexOf("DELETE") !== -1) {
							count = count + 1;
						}
						resolve(true);
					});
				},
				release: function () {
					return true;
				},
			};
		};
		upserter = new DataUpserter();
		upserter.setDatabaseQuerier(defaultDatabaseQuerier);
	});
	test("delete filters that aren't associated with any assets", async () => {
		count = 0;
		expect(await upserter.deleteOrphanedRecords()).toEqual(undefined);
		expect(count).toEqual(11);
	});

	test("error delete filters that aren't associated with any assets", async () => {
		errorMessage = "Something has been wrong";
		defaultDatabaseQuerier.connect = function () {
			return {
				query: function (query) {
					return new Promise((resolve, reject) => {
						throw errorMessage;
						resolve(true);
					});
				},
				release: function () {
					return true;
				},
			};
		};
		count = 0;
		try {
			expect(await upserter.deleteOrphanedRecords()).toEqual(new Error(errorMessage));
		} catch (e) {
			expect(e).toEqual(errorMessage);
		}
		expect(count).toEqual(0);
	});
});
