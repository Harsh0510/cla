import { jest, expect, test, beforeEach, afterEach } from "@jest/globals";
import { Pool } from "pg";
import TJsonValue from "../../../src/common/TJsonValue";

let mockDeleteSelfCalledCount = 0;
let mockDeleteTaskCalledCount = 0;
let mockPushTaskCalledCount = 0;
let mockDeleteSelfErrorMessage: string | null = null;

jest.mock("../../../src/common/asyncTaskRunner/common", () => {
	return {
		pushTask: () => {
			++mockPushTaskCalledCount;
		},
		deleteTask: () => {
			++mockDeleteTaskCalledCount;
		},
	};
});

jest.mock("../../../src/common/asyncTaskRunner/AsyncTaskDetails", () => {
	return class {
		async deleteSelf() {
			++mockDeleteSelfCalledCount;
			if (mockDeleteSelfErrorMessage) {
				throw new Error(mockDeleteSelfErrorMessage);
			}
			return true;
		}
	};
});

import AsyncTaskRunner from "../../../src/common/asyncTaskRunner/AsyncTaskRunner";

const origConsoleLog = console.log;

const origSetTimeout = setTimeout;

let mockQueryArgs: [string, TJsonValue[]][] = [];
let mockQueryResult: TJsonValue[] = [];
let mockQueryRunner: null | ((text: string) => void) = null;

const wait = (ms: number) => new Promise((resolve) => origSetTimeout(resolve, ms));

beforeEach(() => {
	mockDeleteSelfCalledCount = 0;
	mockDeleteTaskCalledCount = 0;
	mockPushTaskCalledCount = 0;
	mockDeleteSelfErrorMessage = null;
	mockQueryRunner = null;
	const p = (cb: () => void) => origSetTimeout(cb, 20);
	global.setTimeout = p as typeof global.setTimeout;
	mockQueryArgs = [];
	mockQueryResult = [];
	global.console.log = jest.fn();
});

afterEach(() => {
	global.setTimeout = origSetTimeout;
	global.console.log = origConsoleLog;
});

const getPgPool = () => ({
	connect() {
		return {
			query(text: string, binds: TJsonValue[]) {
				if (mockQueryRunner) {
					mockQueryRunner(text);
				}
				mockQueryArgs.push([text, binds]);
				return {
					rows: mockQueryResult,
					rowCount: mockQueryResult.length,
				};
			},
			release() {
				return;
			},
		};
	},
});

test("stop", async () => {
	const r = new AsyncTaskRunner(getPgPool() as unknown as Pool);
	const route = async () => {
		return;
	};
	r.route("foo", route);
	expect(r.getRoutes()).toEqual({
		foo: route,
	});
});

test("deleteTask", async () => {
	const r = new AsyncTaskRunner(getPgPool() as unknown as Pool);
	r.deleteTask(123);
	expect(mockDeleteTaskCalledCount).toBe(1);
});

test("pushTask", async () => {
	const r = new AsyncTaskRunner(getPgPool() as unknown as Pool);
	r.pushTask({
		callback: "xxx",
	});
	expect(mockPushTaskCalledCount).toBe(1);
});

test("execution errors", async () => {
	mockQueryRunner = (sql: string) => {
		if (sql.includes("SELECT")) {
			throw new Error("did error");
		}
	};
	const r = new AsyncTaskRunner(getPgPool() as unknown as Pool);
	r.execute();
	await wait(200);
	r.stop();
	expect(mockQueryArgs.find((p) => p[0] === "ROLLBACK")).toBeTruthy();
});

test("execute - no results", async () => {
	const r = new AsyncTaskRunner(getPgPool() as unknown as Pool);
	r.execute();
	await wait(200);
	r.stop();
	expect(mockDeleteSelfCalledCount).toBe(0);
});

test("execute - with results", async () => {
	const r = new AsyncTaskRunner(getPgPool() as unknown as Pool);
	let didCallCount = 0;
	r.route("foo", async () => {
		mockQueryResult = [];
		++didCallCount;
	});
	mockQueryResult = [
		{
			id: 5,
			callback_name: "foo",
			data: 12345,
		},
	];
	r.execute();
	await wait(200);
	r.stop();
	expect(mockDeleteSelfCalledCount).toBe(1);
	expect(didCallCount).toBe(1);
});

test("execute - with results - callback fails", async () => {
	const r = new AsyncTaskRunner(getPgPool() as unknown as Pool);
	let didCallCount = 0;
	r.route("foo", async () => {
		mockQueryResult = [];
		++didCallCount;
		throw new Error("broken!");
	});
	mockQueryResult = [
		{
			id: 5,
			callback_name: "foo",
			data: 12345,
		},
	];
	r.execute();
	await wait(200);
	r.stop();
	expect(mockDeleteSelfCalledCount).toBe(1);
	expect(didCallCount).toBe(1);
});

test("execute - with results - deleting self fails", async () => {
	const r = new AsyncTaskRunner(getPgPool() as unknown as Pool);
	mockDeleteSelfErrorMessage = "failed!!";
	let didCallCount = 0;
	r.route("foo", async () => {
		mockQueryResult = [];
		++didCallCount;
	});
	mockQueryResult = [
		{
			id: 5,
			callback_name: "foo",
			data: 12345,
		},
	];
	r.execute();
	await wait(200);
	r.stop();
	expect(mockDeleteSelfCalledCount).toBe(1);
	expect(mockDeleteTaskCalledCount).toBe(1);
	expect(didCallCount).toBe(1);
});

test("stop and clear timeout", async () => {
	const r = new AsyncTaskRunner(getPgPool() as unknown as Pool);
	r.execute();
	r.stop();
	await wait(200);
	expect(mockDeleteSelfCalledCount).toBe(0);
	expect(mockDeleteTaskCalledCount).toBe(0);
});
