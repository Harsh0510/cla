import { expect, test } from "@jest/globals";

import parseJsonRequestBody from "../../src/common/parseJsonRequestBody";

test("no value", () => {
	expect(parseJsonRequestBody(null)).toEqual({});
	expect(parseJsonRequestBody("")).toEqual({});
	expect(parseJsonRequestBody(undefined)).toEqual({});
});

test("success", () => {
	expect(parseJsonRequestBody(`{"foo": 5, "bar": ["xx", 150.5]}`)).toEqual({
		foo: 5,
		bar: ["xx", 150.5],
	});
	expect(parseJsonRequestBody(`{"foo": 1152921504606846976}`)).toEqual({
		foo: 1152921504606846976n,
	});
});

test("error", () => {
	expect(() => parseJsonRequestBody("invalid json here")).toThrow();
});
