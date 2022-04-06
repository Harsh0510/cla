import { expect, test, describe, beforeEach, afterEach } from "@jest/globals";
import { ClientBase } from "pg";

import TJsonValue from "../../../src/common/TJsonValue";

import { pushTask, deleteTask } from "../../../src/common/asyncTaskRunner/common";

const RealDate = Date;

const DEFAULT_NOW = 10000000000;

beforeEach(() => {
	Date.now = () => DEFAULT_NOW;
});

afterEach(() => {
	Date.now = RealDate.now;
});

describe("pushTask", () => {
	test("no key", async () => {
		const log: [string, TJsonValue[]][] = [];
		const client = {
			query(text: string, binds: TJsonValue[]) {
				log.push([text.trim().replace(/[\r\n\s\t]+/g, " "), binds]);
			},
		};
		await pushTask({ callback: "xx" }, client as ClientBase);
		expect(log).toEqual([
			[
				`INSERT INTO async_task (date_to_execute, callback_name, data) VALUES ($1, $2, $3)`,
				[new Date(DEFAULT_NOW - 7 * 24 * 60 * 60 * 1000), "xx", null],
			],
		]);
	});
	test("with key", async () => {
		const log: [string, TJsonValue[]][] = [];
		const client = {
			query(text: string, binds: TJsonValue[]) {
				log.push([text.trim().replace(/[\r\n\s\t]+/g, " "), binds]);
			},
		};
		await pushTask({ callback: "xx", key: "yy" }, client as ClientBase);
		expect(log).toEqual([
			[
				`INSERT INTO async_task (date_to_execute, callback_name, data, key) VALUES ($1, $2, $3, $4) ON CONFLICT(key) DO NOTHING`,
				[new Date(DEFAULT_NOW - 7 * 24 * 60 * 60 * 1000), "xx", null, "yy"],
			],
		]);
	});
	test("with date", async () => {
		const log: [string, TJsonValue[]][] = [];
		const client = {
			query(text: string, binds: TJsonValue[]) {
				log.push([text.trim().replace(/[\r\n\s\t]+/g, " "), binds]);
			},
		};
		const dt = new Date(112233445566);
		const cpy = new Date(dt);
		await pushTask({ callback: "xx", dateToExecute: dt }, client as ClientBase);
		expect(log).toEqual([
			[`INSERT INTO async_task (date_to_execute, callback_name, data) VALUES ($1, $2, $3)`, [cpy, "xx", null]],
		]);
	});
	test("with data - no key", async () => {
		const log: [string, TJsonValue[]][] = [];
		const client = {
			query(text: string, binds: TJsonValue[]) {
				log.push([text.trim().replace(/[\r\n\s\t]+/g, " "), binds]);
			},
		};
		await pushTask({ callback: "xx", data: 9999 }, client as ClientBase);
		expect(log).toEqual([
			[
				`INSERT INTO async_task (date_to_execute, callback_name, data) VALUES ($1, $2, $3)`,
				[new Date(DEFAULT_NOW - 7 * 24 * 60 * 60 * 1000), "xx", "9999"],
			],
		]);
	});
	test("with data AND key", async () => {
		const log: [string, TJsonValue[]][] = [];
		const client = {
			query(text: string, binds: TJsonValue[]) {
				log.push([text.trim().replace(/[\r\n\s\t]+/g, " "), binds]);
			},
		};
		await pushTask({ callback: "xx", data: 9999, key: "yy" }, client as ClientBase);
		expect(log).toEqual([
			[
				`INSERT INTO async_task (date_to_execute, callback_name, data, key) VALUES ($1, $2, $3, $4) ON CONFLICT(key) DO NOTHING`,
				[new Date(DEFAULT_NOW - 7 * 24 * 60 * 60 * 1000), "xx", "9999", "yy"],
			],
		]);
	});
});

test("deleteTask", async () => {
	const log: [string, TJsonValue[]][] = [];
	const client = {
		query(text: string, binds: TJsonValue[]) {
			log.push([text.trim().replace(/[\r\n\s\t]+/g, " "), binds]);
		},
	};
	await deleteTask(123, client as ClientBase);
	expect(log).toEqual([[`DELETE FROM async_task WHERE id = $1`, [123]]]);
});
