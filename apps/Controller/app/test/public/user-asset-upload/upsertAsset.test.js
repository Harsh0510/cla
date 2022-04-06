jest.mock("#tvf-util", () => {
	return {
		async generateObjectIdentifier() {
			return "1".repeat(36);
		},
	};
});

const upsertAssetRaw = require("../../../core/public/user-asset-upload/upsertAsset");

let querier;
let currUserId;
let publisherId;
let authors;
let params;
let querierArgs = [];
let assetExists;
let assetInserts;

const resetAll = () => {
	querierArgs = [];
	querier = (sql) => {
		querierArgs.push([sql]);
		if (sql.indexOf("UPDATE") !== -1) {
			if (assetExists) {
				return {
					rowCount: 1,
					rows: [{ id: 1 }],
				};
			}
			return {
				rowCount: 0,
			};
		}
		if (sql.indexOf("INSERT INTO") !== -1) {
			if (assetInserts) {
				return {
					rowCount: 1,
					rows: [{ id: 50 }],
				};
			}
			return {
				rowCount: 0,
			};
		}
		if (sql.indexOf("SELECT") !== -1) {
			return {
				rowCount: 1,
				rows: [{ id: 123, copyable_page_count: 55, pdf_isbn13: "9780747532743" }],
			};
		}
		throw new Error("never should be here");
	};
	currUserId = 123;
	publisherId = 789;
	authors = [
		{
			first_name: "John",
			last_name: "Doe",
		},
	];
	params = {
		title: "TT",
		page_count: 150,
		isbn: "9780747532743",
		publisher: "PP",
		publication_date: 123123123123,
	};
	assetExists = false;
	assetInserts = true;
};

beforeEach(resetAll);
afterEach(resetAll);

const upsertAsset = () => upsertAssetRaw(querier, currUserId, publisherId, authors, params);

test("inserted - with publication_date", async () => {
	const ret = await upsertAsset();
	expect(ret).toEqual({
		id: 50,
		did_insert: true,
		copyable_page_count: 150,
		authors_string: "John Doe",
	});
	expect(querierArgs[1][0]).toMatch("TO_TIMESTAMP(123123123123)");
});

test("inserted - with no publication_date", async () => {
	delete params.publication_date;
	const ret = await upsertAsset();
	expect(ret).toEqual({
		id: 50,
		did_insert: true,
		copyable_page_count: 150,
		authors_string: "John Doe",
	});
	expect(querierArgs[1][0]).not.toMatch("TO_TIMESTAMP(123123123123)");
	expect(querierArgs[1][0]).toMatch("NULL");
});

test("did not insert - got existing", async () => {
	assetExists = false;
	assetInserts = false;
	const ret = await upsertAsset();
	expect(ret).toEqual({
		id: 123,
		did_insert: false,
		copyable_page_count: 55,
		authors_string: undefined,
	});
});

test("did not insert, could not select", async () => {
	querier = () => ({
		rowCount: 0,
		rows: [],
	});
	await expect(upsertAsset).rejects.toThrowError("Unexpected [1]");
});
