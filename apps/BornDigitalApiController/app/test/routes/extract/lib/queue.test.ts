import { expect, test, jest, beforeEach } from "@jest/globals";
import IExtract from "../../../../src/common/IExtract";
import TJsonValue from "../../../../src/common/TJsonValue";
import { TQuerier } from "../../../../src/common/TQuerier";

let mockQueries: [string, TJsonValue[]][] = [];
let mockQueryResult: TJsonValue[] = [];
let mockProcessExtractArgs: [IExtract, string | null | undefined][] = [];

jest.mock("../../../../src/common/db", () => {
	return {
		async query(text: string, binds: TJsonValue[]) {
			mockQueries.push([text, binds]);
			return {
				rows: mockQueryResult,
				rowCount: mockQueryResult.length,
			};
		},
	};
});

jest.mock("../../../../src/common/processExtract", () => {
	return async (querier: TQuerier, extract: IExtract, requestId?: string | null | undefined) => {
		querier;
		mockProcessExtractArgs.push([extract, requestId]);
		return true;
	};
});

const getExtract = (id: number): IExtract => ({
	id: id,
	isbn: "xxx",
	asset_id: 555,
	pages: [1, 2, 3],
	name: "yyy",
});

import queue from "../../../../src/routes/extract/lib/queue";

beforeEach(() => {
	mockQueries = [];
	mockQueryResult = [];
	mockProcessExtractArgs = [];
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("works", async () => {
	queue(getExtract(15), "a");
	queue(getExtract(25), "b");
	queue(getExtract(35), "c");
	queue(getExtract(45), "d");
	await wait(100);
	expect(mockProcessExtractArgs).toEqual([
		[getExtract(15), "a"],
		[getExtract(25), "b"],
		[getExtract(35), "c"],
		[getExtract(45), "d"],
	]);
});
