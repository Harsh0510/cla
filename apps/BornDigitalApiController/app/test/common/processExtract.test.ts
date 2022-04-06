import { expect, test, jest, beforeEach, afterEach } from "@jest/globals";
import { ILogParams } from "../../src/common/log";

let mockLogArgs: ILogParams[] = [];
let mockExec: () => null = () => null;

class BlockBlobClient {
	public name: string;
	constructor(name: string) {
		this.name = name;
	}
	public downloadToFile() {
		("");
	}
	public uploadFile() {
		("");
	}
}

class ContainerClient {
	public name: string;
	constructor(name: string) {
		this.name = name;
	}

	public getBlockBlobClient(name: string) {
		return new BlockBlobClient(name);
	}
}

jest.mock("fs/promises", () => {
	return {
		async unlink() {
			("");
		},
	};
});

jest.mock("crypto", () => {
	return {
		randomBytes(count: number) {
			return "a".repeat(count);
		},
	};
});

jest.mock("../../src/common/log.ts", () => {
	return (params: ILogParams) => {
		mockLogArgs.push(params);
	};
});

jest.mock("../../src/common/exec.ts", () => {
	return () => mockExec();
});

jest.mock("../../src/common/blobService", () => {
	return {
		getContainerClient(containerName: string) {
			return new ContainerClient(containerName);
		},
	};
});

import processExtract from "../../src/common/processExtract";
import { TQuerier } from "../../src/common/TQuerier";

const RealDate = Date;

beforeEach(() => {
	mockLogArgs = [];
	mockExec = () => null;
	Date.now = () => 123456789;
});

afterEach(() => {
	Date.now = RealDate.now;
});

test("intercepted", async () => {
	const querier = () => ({ rowCount: 0, rows: [] });
	const ret = await processExtract(querier as unknown as TQuerier, {
		asset_id: 5,
		id: 6,
		isbn: "a",
		name: "b",
		pages: [1],
	});
	expect(ret).toBe(false);
	expect(mockLogArgs).toEqual([
		{
			message: "async extract processing - begin",
			request_id: "a".repeat(18),
			extract_id: 6,
		},
		{
			message: "async extract processing - complete - intercepted",
			request_id: "a".repeat(18),
			extract_id: 6,
			time_taken_ms: 0,
		},
	]);
});

test("success", async () => {
	const querier = () => ({ rowCount: 1, rows: [{ id: 1 }] });
	const ret = await processExtract(querier as unknown as TQuerier, {
		asset_id: 5,
		id: 6,
		isbn: "a",
		name: "b",
		pages: [1],
	});
	expect(ret).toBe(true);
	expect(mockLogArgs).toEqual([
		{
			message: "async extract processing - begin",
			request_id: "a".repeat(18),
			extract_id: 6,
		},
		{
			message: "async extract processing - complete - success",
			request_id: "a".repeat(18),
			extract_id: 6,
			time_taken_ms: 0,
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("errors", async () => {
	const querier = () => ({ rowCount: 1, rows: [{ id: 1 }] });
	const err = new Error("some error");
	mockExec = () => {
		throw err;
	};
	try {
		await processExtract(querier as unknown as TQuerier, {
			asset_id: 5,
			id: 6,
			isbn: "a",
			name: "b",
			pages: [1],
		});
	} catch {}
	expect(mockLogArgs).toEqual([
		{
			message: "async extract processing - begin",
			request_id: "a".repeat(18),
			extract_id: 6,
		},
		{
			message: "async extract processing - complete - error",
			request_id: "a".repeat(18),
			extract_id: 6,
			time_taken_ms: 0,
			exception_message: "some error",
			exception_stack: err.stack,
		},
	]);
});
