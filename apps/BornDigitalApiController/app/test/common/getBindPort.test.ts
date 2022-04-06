import { expect, test, afterEach } from "@jest/globals";

const origProcessEnv = { ...process.env };

afterEach(() => {
	process.env = { ...origProcessEnv };
});

import getBindPort from "../../src/common/getBindPort";

test("no port", () => {
	process.env["BDAPI_BIND_PORT"] = "";
	expect(getBindPort()).toBe(80);
});

test("valid port", () => {
	process.env["BDAPI_BIND_PORT"] = "123";
	expect(getBindPort()).toBe(123);
});

test("invalid port", () => {
	process.env["BDAPI_BIND_PORT"] = "xxxfoo";
	expect(getBindPort()).toBe(80);
});
