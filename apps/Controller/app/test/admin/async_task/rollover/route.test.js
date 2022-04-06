let mockPushTaskCalls = [];
let mockFooCalls = [];
let mockBarCalls = [];
let mockBazCalls = [];

jest.mock("../../../../core/admin/async_task/rollover/pushTask.js", () => {
	return (...args) => {
		mockPushTaskCalls.push([...args]);
	};
});
jest.mock("../../../../core/admin/async_task/rollover/actions.js", () => {
	return {
		foo(...args) {
			mockFooCalls.push([...args]);
		},
		bar(...args) {
			mockBarCalls.push([...args]);
		},
		baz(...args) {
			mockBazCalls.push([...args]);
		},
	};
});

const route = require("../../../../core/admin/async_task/rollover/route");

function resetAll() {
	mockPushTaskCalls = [];
	mockFooCalls = [];
	mockBarCalls = [];
	mockBazCalls = [];
}

beforeEach(resetAll);
afterEach(resetAll);

test("errors", async () => {
	let error;
	try {
		await route({
			deleteSelf() {},
			query() {
				throw new Error("oops");
			},
		});
	} catch (e) {
		error = e;
	}
	expect(mockPushTaskCalls.length).toBe(1);
	expect(!!error).toBe(true);
});

test("no rollovers to execute", async () => {
	await route({
		deleteSelf() {},
		query() {
			return {
				rowCount: 0,
				rows: [],
			};
		},
	});
	expect(mockPushTaskCalls.length).toBe(1);
	expect(mockFooCalls.length).toBe(0);
	expect(mockBarCalls.length).toBe(0);
	expect(mockBazCalls.length).toBe(0);
});

test("rollovers with unknown status", async () => {
	await route({
		deleteSelf() {},
		query() {
			return {
				rowCount: 1,
				rows: [
					{
						id: 123,
						status: "unknown status!!",
						target_execution_date: new Date(),
					},
				],
			};
		},
	});
	expect(mockPushTaskCalls.length).toBe(1);
	expect(mockFooCalls.length).toBe(0);
	expect(mockBarCalls.length).toBe(0);
	expect(mockBazCalls.length).toBe(0);
});

test("rollovers need to be executed", async () => {
	await route({
		deleteSelf() {},
		query() {
			return {
				rowCount: 3,
				rows: [
					{
						id: 123,
						status: "baz",
						target_execution_date: new Date(),
					},
					{
						id: 456,
						status: "foo",
						target_execution_date: new Date(),
					},
					{
						id: 789,
						status: "baz",
						target_execution_date: new Date(),
					},
				],
			};
		},
	});
	expect(mockPushTaskCalls.length).toBe(1);
	expect(mockFooCalls.length).toBe(1);
	expect(mockBarCalls.length).toBe(0);
	expect(mockBazCalls.length).toBe(2);
	expect(mockFooCalls[0][1]).toBe(456);
	expect(mockBazCalls[0][1]).toBe(123);
	expect(mockBazCalls[1][1]).toBe(789);
});
