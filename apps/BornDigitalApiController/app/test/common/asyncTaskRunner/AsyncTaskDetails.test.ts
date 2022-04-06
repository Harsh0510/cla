import { jest, expect, test, beforeEach } from "@jest/globals";
import { ClientBase, Pool } from "pg";

let mockPushTaskArgs: object[] = [];
let mockDeleteTaskArgs: [number, ClientBase | Pool][] = [];

jest.mock("../../../src/common/asyncTaskRunner/common", () => {
	return {
		pushTask(settings: object) {
			mockPushTaskArgs.push(settings);
		},
		deleteTask(databaseId: number, client: ClientBase | Pool) {
			mockDeleteTaskArgs.push([databaseId, client]);
		},
	};
});

import AsyncTaskDetails from "../../../src/common/asyncTaskRunner/AsyncTaskDetails";

beforeEach(() => {
	mockPushTaskArgs = [];
	mockDeleteTaskArgs = [];
});

test("getTaskData", async () => {
	const d = new AsyncTaskDetails({ id: 5, data: 5555 }, {
		query() {
			("");
		},
	} as unknown as ClientBase);
	expect(d.getTaskData()).toBe(5555);
});

test("getDbId", async () => {
	const d = new AsyncTaskDetails({ id: 5, data: 5555 }, {
		query() {
			("");
		},
	} as unknown as ClientBase);
	expect(d.getDbId()).toBe(5);
});

test("pushTask", async () => {
	const d = new AsyncTaskDetails({ id: 5, data: 5555 }, {
		query() {
			("");
		},
	} as unknown as ClientBase);
	d.pushTask({ callback: "xxx" });
	expect(mockPushTaskArgs).toEqual([{ callback: "xxx" }]);
	expect(mockDeleteTaskArgs).toEqual([]);
});

test("deleteSelf", async () => {
	const client = {
		query() {
			("");
		},
	};
	const d = new AsyncTaskDetails({ id: 5, data: 5555 }, client as unknown as ClientBase);
	d.deleteSelf();
	expect(mockPushTaskArgs).toEqual([]);
	expect(mockDeleteTaskArgs).toEqual([[5, client]]);
});

test("query", async () => {
	const client = {
		query() {
			return "test";
		},
	};
	const d = new AsyncTaskDetails({ id: 5, data: 5555 }, client as unknown as ClientBase);
	expect(d.query("foo")).toBe("test");
	expect(mockPushTaskArgs).toEqual([]);
	expect(mockDeleteTaskArgs).toEqual([]);
});

test("appDbQuery", async () => {
	const client = {
		query() {
			return "test";
		},
	};
	const d = new AsyncTaskDetails({ id: 5, data: 5555 }, client as unknown as ClientBase);
	expect(d.appDbQuery("foo")).toBe("test");
	expect(mockPushTaskArgs).toEqual([]);
	expect(mockDeleteTaskArgs).toEqual([]);
});
