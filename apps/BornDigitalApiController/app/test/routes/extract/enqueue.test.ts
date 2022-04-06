import { expect, test, jest, beforeEach } from "@jest/globals";
import TJsonValue from "../../../src/common/TJsonValue";
import IAsset from "../../../src/routes/extract/lib/IAsset";

let mockEnqueueExtract: IEnqueueResultDone | IEnqueueResultEnqueued = {
	status: "enqueued",
};
let mockAsset: IAsset | null = null;
let mockPages: number[] = [];

jest.mock("../../../src/routes/extract/lib/validate", () => {
	return (params: TJsonValue) => params;
});

jest.mock("../../../src/routes/extract/lib/enqueueExtract", () => {
	return async (): Promise<IEnqueueResultDone | IEnqueueResultEnqueued> => mockEnqueueExtract;
});

jest.mock("../../../src/routes/extract/lib/fetchAssetById", () => {
	return async () => mockAsset;
});

jest.mock("../../../src/routes/extract/lib/fetchValidPages", () => {
	return async () => mockPages;
});

import enqueue from "../../../src/routes/extract/enqueue";
import { IEnqueueResultDone, IEnqueueResultEnqueued } from "../../../src/routes/extract/lib/IEnqueueResult";

const getDefaultAsset = (): IAsset => ({
	id: 123,
	page_count: 500,
	page_offset_arabic: 0,
	page_offset_roman: 0,
	pdf_isbn13: "9780747532743",
	withdrawn: false,
});

beforeEach(() => {
	mockEnqueueExtract = {
		status: "enqueued",
	};
	mockAsset = getDefaultAsset();
	mockPages = [];
});

test("error - asset not found", async () => {
	mockAsset = null;
	await expect(enqueue({}, "")).rejects.toThrow("asset not found");
});

test("error - asset withdrawn", async () => {
	mockAsset = getDefaultAsset();
	mockAsset.withdrawn = true;
	await expect(enqueue({}, "")).rejects.toThrow("asset withdrawn");
});

test("success - enqueued", async () => {
	await expect(enqueue({}, "")).resolves.toEqual({
		status: "enqueued",
	});
});

test("success - done", async () => {
	mockEnqueueExtract = {
		status: "done",
		url: "https://mysite.com/hi/there.pdf",
	};
	await expect(enqueue({}, "")).resolves.toEqual({
		status: "done",
		url: "https://mysite.com/hi/there.pdf",
	});
});
