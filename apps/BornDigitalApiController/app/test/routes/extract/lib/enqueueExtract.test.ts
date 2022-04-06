import { expect, test, jest, beforeEach } from "@jest/globals";
import IExtract from "../../../../src/common/IExtract";
import TJsonValue from "../../../../src/common/TJsonValue";

let mockEnqueue = [];
let mockQueries: [string, TJsonValue[]][] = [];
let mockQueryResult: TJsonValue[] = [];

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

jest.mock("../../../../src/routes/extract/lib/fetchExtractAzureBlobName", () => {
	return () => "the_blob_name";
});

jest.mock("../../../../src/routes/extract/lib/fetchSasUrl", () => {
	return async () => "https://google.com/sas_url.pdf";
});

jest.mock("../../../../src/routes/extract/lib/queue", () => {
	return (extract: IExtract, requestId?: string | null | undefined) => {
		mockEnqueue.push([extract, requestId]);
	};
});

import enqueueExtract from "../../../../src/routes/extract/lib/enqueueExtract";

beforeEach(() => {
	mockEnqueue = [];
	mockQueries = [];
	mockQueryResult = [];
});

test("unstarted", async () => {
	mockQueryResult = [
		{
			id: 123,
			status: "unstarted",
			error: null,
		},
	];
	const res = await enqueueExtract(11, "22", []);
	expect(res).toEqual({
		status: "enqueued",
	});
	expect(mockEnqueue.length).toBe(1);
	expect(mockQueries.length).toBe(1);
});

test("running", async () => {
	mockQueryResult = [
		{
			id: 123,
			status: "running",
			error: null,
		},
	];
	const res = await enqueueExtract(11, "22", []);
	expect(res).toEqual({
		status: "enqueued",
	});
	expect(mockEnqueue.length).toBe(0);
	expect(mockQueries.length).toBe(1);
});

test("failed", async () => {
	mockQueryResult = [
		{
			id: 123,
			status: "completed",
			error: "some error here",
		},
	];
	const res = await enqueueExtract(11, "22", []);
	expect(res).toEqual({
		status: "enqueued",
	});
	expect(mockEnqueue.length).toBe(1);
	expect(mockQueries.length).toBe(2);
	expect((mockQueries[1] as string[])[0]).toMatch("UPDATE");
});

test("succeeded", async () => {
	mockQueryResult = [
		{
			id: 123,
			status: "completed",
			error: null,
		},
	];
	const res = await enqueueExtract(11, "22", []);
	expect(res).toEqual({
		status: "done",
		url: "https://google.com/sas_url.pdf",
	});
	expect(mockEnqueue.length).toBe(0);
	expect(mockQueries.length).toBe(1);
});
