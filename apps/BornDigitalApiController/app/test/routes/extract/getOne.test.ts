import { expect, test, jest, beforeEach } from "@jest/globals";
import TJsonValue from "../../../src/common/TJsonValue";
import IAsset from "../../../src/routes/extract/lib/IAsset";

let mockResult: TJsonValue[] = [];
let mockAsset: IAsset | null = null;
let mockPages: number[] = [];
let mockBlobName = "";
let mockSasUrl = "";

jest.mock("../../../src/common/db", () => {
	return {
		query() {
			return {
				rows: mockResult,
				rowCount: mockResult.length,
			};
		},
	};
});

jest.mock("../../../src/routes/extract/lib/validate", () => {
	return (params: TJsonValue) => params;
});

jest.mock("../../../src/routes/extract/lib/fetchAssetById", () => {
	return async () => mockAsset;
});

jest.mock("../../../src/routes/extract/lib/fetchValidPages", () => {
	return async () => mockPages;
});

jest.mock("../../../src/routes/extract/lib/fetchExtractAzureBlobName", () => {
	return () => mockBlobName;
});

jest.mock("../../../src/routes/extract/lib/fetchSasUrl", () => {
	return () => mockSasUrl;
});

import getOne from "../../../src/routes/extract/getOne";

const getDefaultAsset = (): IAsset => ({
	id: 123,
	page_count: 500,
	page_offset_arabic: 0,
	page_offset_roman: 0,
	pdf_isbn13: "9780747532743",
	withdrawn: false,
});

beforeEach(() => {
	mockResult = [];
	mockAsset = getDefaultAsset();
	mockPages = [];
	mockBlobName = "";
	mockSasUrl = "";
});

test("error - asset not found", async () => {
	mockAsset = null;
	await expect(getOne({})).rejects.toThrow("asset not found");
});

test("error - asset withdrawn", async () => {
	mockAsset = getDefaultAsset();
	mockAsset.withdrawn = true;
	await expect(getOne({})).rejects.toThrow("asset withdrawn");
});

test("success - not found", async () => {
	await expect(getOne({})).resolves.toEqual({
		status: "not_found",
	});
});

test("success - enqueued", async () => {
	mockResult = [
		{
			status: "enqueued",
			error: null,
		},
	];
	await expect(getOne({})).resolves.toEqual({
		status: "enqueued",
	});
});

test("success - completed with error", async () => {
	mockResult = [
		{
			status: "completed",
			error: "some error",
		},
	];
	await expect(getOne({})).resolves.toEqual({
		status: "failed",
		message: "some error",
	});
});

test("success - completed with no error", async () => {
	mockResult = [
		{
			status: "completed",
		},
	];
	mockSasUrl = "https://google.com/foo/bar.pdf";
	await expect(getOne({})).resolves.toEqual({
		status: "done",
		url: "https://google.com/foo/bar.pdf",
	});
});
