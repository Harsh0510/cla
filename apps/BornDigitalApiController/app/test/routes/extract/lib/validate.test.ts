import { expect, test } from "@jest/globals";
import TJsonValue from "../../../../src/common/TJsonValue";

import validate from "../../../../src/routes/extract/lib/validate";

const getParams = (key: string, value: TJsonValue) => ({
	asset_id: 12345,
	pages: [5, 10, 15, "ii", "vi", "F"],
	[key]: value,
});

const a = (value: TJsonValue) => validate(getParams("asset_id", value));
const p = (value: TJsonValue) => validate(getParams("pages", value));

test("errors", async () => {
	expect(() => a(null)).toThrow("asset_id must be a number");
	expect(() => a(true)).toThrow("asset_id must be a number");
	expect(() => a([5, 6, 7])).toThrow("asset_id must be a number");
	expect(() => a(-123)).toThrow("asset_id must be positive");
	expect(() => a(123.5)).toThrow("asset_id must be an integer");

	expect(() => p(null)).toThrow("pages must be an array");
	expect(() => p(true)).toThrow("pages must be an array");
	expect(() => p(5)).toThrow("pages must be an array");
	expect(() => p([])).toThrow("pages must have at least one element");
	expect(() => p(new Array(5000))).toThrow("cannot copy more than 2000 pages");

	expect(() => p([true])).toThrow("page must be a string or number");
	expect(() => p([-5])).toThrow("page must be positive");
	expect(() => p([50000])).toThrow("page too large");
	expect(() => p([123.5])).toThrow("page must be an integer");

	expect(() => p([""])).toThrow("page cannot be empty");
	expect(() => p(["aaaaaaaa"])).toThrow("page too large");

	expect(() => p([5, 6, 8, 6])).toThrow("pages must be unique");
});

test("success", async () => {
	expect(
		validate({
			asset_id: 123,
			pages: [10, 50, 80, "  ii", "xi   ", "AA"],
		})
	).toEqual({
		asset_id: 123,
		pages: new Set([10, 50, 80, "ii", "xi", "AA"]),
	});
});
