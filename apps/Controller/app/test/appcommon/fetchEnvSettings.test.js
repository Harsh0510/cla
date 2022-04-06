const fetchEnvSettings = require("../../common/fetchEnvSettings");

let mockKkeys;
let mockResult;

const mockTaskDetail = new (class TaskDetail {
	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT key,value`) !== 1) {
			return mockResult;
		}
		return;
	}
})();

function resetAll() {
	mockResult = {
		rows: [
			{ key: 0, value: "val1" },
			{ key: 1, value: "val2" },
		],
		rowCount: 2,
	};
	mockKkeys = "wonde_school_sync__disable_filtering";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Get data`, async () => {
	const data = await fetchEnvSettings(mockTaskDetail.query.bind(mockTaskDetail), mockKkeys);
	expect(data).toEqual("val1");
});

test(`When not Get data`, async () => {
	mockResult.rowCount = 0;
	const data = await fetchEnvSettings(mockTaskDetail.query.bind(mockTaskDetail), mockKkeys);
	expect(data).toEqual(null);
});

test("when key is not string type", async () => {
	mockKkeys = ["wonde_school_sync__disable_filtering"];
	const data = await fetchEnvSettings(mockTaskDetail.query.bind(mockTaskDetail), mockKkeys);
	expect(data).toEqual({ "0": "val1", "1": "val2" });
});

test("when key is not string type", async () => {
	mockKkeys = ["wonde_school_sync__disable_filtering"];
	mockResult = {
		rows: [
			{ key: 0, value: { _value: "val1" } },
			{ key: 1, value: { _value: "val2" } },
		],
		rowCount: 2,
	};
	const data = await fetchEnvSettings(mockTaskDetail.query.bind(mockTaskDetail), mockKkeys);
	expect(data).toEqual({ "0": "val1", "1": "val2" });
});
