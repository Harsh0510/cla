const fetchPublisherId = require("../../../core/public/user-asset-upload/fetchPublisherId");

let querier;
let currUserId;

function resetAll() {
	querier = async () => {
		return {
			rowCount: 1,
			rows: [{ id: 123 }],
		};
	};
	currUserId = 12345;
}

beforeEach(resetAll);
afterEach(resetAll);

test("insert successfully", async () => {
	const ret = await fetchPublisherId(querier, 12345, "test");
	expect(ret).toBe(123);
});

test("did not insert - selected instead", async () => {
	querier = async (query) => {
		if (query.includes("INSERT INTO")) {
			return {
				rowCount: 0,
				rows: [],
			};
		}
		return {
			rowCount: 1,
			rows: [{ id: 456 }],
		};
	};
	const ret = await fetchPublisherId(querier, 12345, "test");
	expect(ret).toBe(456);
});

test("did not insert and could not select", async () => {
	querier = async (query) => {
		return {
			rowCount: 0,
			rows: [],
		};
	};
	await expect(fetchPublisherId(querier, 12345, "test")).rejects.toThrowError("unexpected error [1]");
});
