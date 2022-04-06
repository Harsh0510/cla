import { expect, test, jest, beforeEach } from "@jest/globals";
import TJsonValue from "../../../../src/common/TJsonValue";

let mockQuery: [string, TJsonValue[]][] = [];
let mockQueryResult: TJsonValue[] = [];

jest.mock("../../../../src/common/db", () => {
	return {
		async query(text: string, binds: TJsonValue[]) {
			mockQuery.push([text, binds]);
			return {
				rows: mockQueryResult,
				rowCount: mockQueryResult.length,
			};
		},
	};
});

import fetchAssetById from "../../../../src/routes/extract/lib/fetchAssetById";

beforeEach(() => {
	mockQuery = [];
	mockQueryResult = [];
});

test("no results", async () => {
	mockQueryResult = [];
	expect(fetchAssetById(5)).resolves.toEqual(null);
	expect(mockQuery.length).toBe(1);
	expect((mockQuery[0] as string[])[0]).toMatch("SELECT");
	expect((mockQuery[0] as TJsonValue[])[1]).toEqual([5]);
});

test("with results", async () => {
	mockQueryResult = [
		{
			id: 123,
			pdf_isbn13: "def",
			page_offset_roman: 5,
			page_offset_arabic: 10,
			page_count: 100,
		},
	];
	expect(fetchAssetById(456)).resolves.toEqual({
		id: 123,
		pdf_isbn13: "def",
		page_offset_roman: 5,
		page_offset_arabic: 10,
		page_count: 100,
	});
	expect((mockQuery[0] as string[])[0]).toMatch("SELECT");
	expect((mockQuery[0] as TJsonValue[])[1]).toEqual([456]);
});
