import { expect, test, jest, beforeEach } from "@jest/globals";
import TJsonValue from "../../../src/common/TJsonValue";

let mockResult: TJsonValue[] = [];

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

jest.mock("../../../src/common/blobService", () => {
	return {
		url: "https://google.com/",
	};
});

import getAll from "../../../src/routes/asset/getAll";

beforeEach(() => {
	mockResult = [];
});

test("errors - modified since", async () => {
	await expect(getAll({ modified_since: "hello" })).rejects.toThrow("modified_since must be a number");
	await expect(getAll({ modified_since: -50 })).rejects.toThrow("modified_since must not be negative");
	await expect(getAll({ modified_since: -50n })).rejects.toThrow("modified_since must not be negative");
	await expect(getAll({ modified_since: 2n ** 63n + 5n })).rejects.toThrow("modified_since too large");
	await expect(getAll({ modified_since: 5.5 })).rejects.toThrow("modified_since must be an integer");
});

test("errors - limit", async () => {
	await expect(getAll({ limit: null })).rejects.toThrow("limit must be a number");
	await expect(getAll({ limit: [5] })).rejects.toThrow("limit must be a number");
	await expect(getAll({ limit: -50 })).rejects.toThrow("limit must be positive");
	await expect(getAll({ limit: 0 })).rejects.toThrow("limit must be positive");
	await expect(getAll({ limit: 10000000 })).rejects.toThrow("limit must not exceed 10000");
	await expect(getAll({ limit: 10.5 })).rejects.toThrow("limit must be an integer");
});

test("success - no results", async () => {
	mockResult = [];
	await expect(getAll({})).resolves.toEqual({
		records: [],
		has_more: false,
	});
});

test("success - some results, no authors", async () => {
	mockResult = [
		{
			id: 111,
			authors: null,
			isbn: "12345",
		},
		{
			id: 222,
			isbn: "6789",
		},
	];
	await expect(getAll({})).resolves.toEqual({
		has_more: false,
		records: [
			{
				id: 111,
				authors: [],
				isbn: "12345",
				cover_image: "https://google.com/coverpages/12345.png",
			},
			{
				id: 222,
				authors: [],
				isbn: "6789",
				cover_image: "https://google.com/coverpages/6789.png",
			},
		],
	});
});

test("success - some results, with authors", async () => {
	mockResult = [
		{
			id: 111,
			authors: [
				{
					role: "A",
					firstName: "John",
					lastName: "Smith",
				},
				{
					role: "E",
					firstName: "Edith",
					lastName: "Edison",
				},
				{
					role: "A",
					firstName: "Mary",
					lastName: "James",
				},
			],
			isbn: "12345",
		},
		{
			id: 222,
			authors: [
				{
					role: "A",
					firstName: "Jen",
					lastName: "Gina",
				},
				{
					role: "T",
					firstName: "Timor",
					lastName: "Tomasson",
				},
			],
			isbn: "6789",
		},
	];
	await expect(getAll({})).resolves.toEqual({
		has_more: false,
		records: [
			{
				id: 111,
				authors: [
					{
						first_name: "John",
						last_name: "Smith",
					},
					{
						first_name: "Mary",
						last_name: "James",
					},
				],
				isbn: "12345",
				cover_image: "https://google.com/coverpages/12345.png",
			},
			{
				id: 222,
				authors: [
					{
						first_name: "Jen",
						last_name: "Gina",
					},
				],
				isbn: "6789",
				cover_image: "https://google.com/coverpages/6789.png",
			},
		],
	});
});

test("success - has more", async () => {
	mockResult = [
		{ id: 111, isbn: "aa" },
		{ id: 222, isbn: "bb" },
		{ id: 333, isbn: "cc" },
		{ id: 444, isbn: "dd" },
		{ id: 555, isbn: "ee" },
	];
	await expect(getAll({ limit: 4 })).resolves.toEqual({
		has_more: true,
		records: [
			{
				id: 111,
				authors: [],
				isbn: "aa",
				cover_image: "https://google.com/coverpages/aa.png",
			},
			{
				id: 222,
				authors: [],
				isbn: "bb",
				cover_image: "https://google.com/coverpages/bb.png",
			},
			{
				id: 333,
				authors: [],
				isbn: "cc",
				cover_image: "https://google.com/coverpages/cc.png",
			},
			{
				id: 444,
				authors: [],
				isbn: "dd",
				cover_image: "https://google.com/coverpages/dd.png",
			},
		],
	});
});
