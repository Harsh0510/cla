import { jest, expect, test, beforeEach } from "@jest/globals";
import IExtract from "../../../src/common/IExtract";
import TJsonValue from "../../../src/common/TJsonValue";
import { TQuerier } from "../../../src/common/TQuerier";

let mockProcessExtractCallCount = 0;
let mockProcessExtract: (id: number) => void = () => {
	return;
};

jest.mock("../../../src/common/processExtract", () => {
	return (querier: TQuerier, extract: IExtract) => {
		querier;
		++mockProcessExtractCallCount;
		mockProcessExtract(extract.id);
	};
});

import execute from "../../../src/asyncTasks/generateExtractTask/execute";

beforeEach(() => {
	mockProcessExtractCallCount = 0;
	mockProcessExtract = () => {
		return;
	};
});

const makeQuerier = (rows: TJsonValue[]) => () => ({
	rows: rows,
	rowCount: rows.length,
});

test("no results", async () => {
	await execute(makeQuerier([]) as unknown as TQuerier);
	expect(mockProcessExtractCallCount).toBe(0);
});

test("some results - execute successfully", async () => {
	await execute(makeQuerier([{ id: 5 }, { id: 10 }]) as unknown as TQuerier);
	expect(mockProcessExtractCallCount).toBe(2);
});

test("some results - some results error", async () => {
	mockProcessExtract = (id: number) => {
		if (id === 15) {
			throw new Error("did error!!");
		}
	};
	const consoleError = jest.spyOn(console, "error").mockImplementation(() => null);
	await execute(makeQuerier([{ id: 5 }, { id: 10 }, { id: 15 }, { id: 20 }]) as unknown as TQuerier);
	expect(mockProcessExtractCallCount).toBe(4);
	expect(consoleError.mock.calls.length).toBe(1);
});
