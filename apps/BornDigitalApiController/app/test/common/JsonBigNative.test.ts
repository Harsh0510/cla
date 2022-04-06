import { expect, test } from "@jest/globals";

import JsonBigNative from "../../src/common/JsonBigNative";

test("works", () => {
	expect(JsonBigNative.parse(`{"foo": 1152921504606846976}`)).toEqual({
		foo: 1152921504606846976n,
	});
	expect(JsonBigNative.parse(`{"foo": 500}`)).toEqual({
		foo: 500,
	});
});
