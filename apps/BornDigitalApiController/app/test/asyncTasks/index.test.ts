import { jest, expect, test, beforeEach } from "@jest/globals";

let mockGenerateExtractTaskCallCount = 0;

jest.mock("../../src/asyncTasks/generateExtractTask/index", () => {
	return () => {
		++mockGenerateExtractTaskCallCount;
	};
});

import index from "../../src/asyncTasks/index";
import AsyncTaskRunner from "../../src/common/asyncTaskRunner/AsyncTaskRunner";

beforeEach(() => {
	mockGenerateExtractTaskCallCount = 0;
});

test("runs", async () => {
	await index(null as unknown as AsyncTaskRunner);
	expect(mockGenerateExtractTaskCallCount).toBe(1);
});
