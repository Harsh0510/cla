import { expect, test, afterEach } from "@jest/globals";

const origProcessEnv = { ...process.env };

afterEach(() => {
	process.env = { ...origProcessEnv };
});

import getApiKeys from "../../src/common/getApiKeys";

test("no keys set", () => {
	process.env["BDAPI_API_KEYS"] = "";
	expect(getApiKeys()).toEqual(new Set<string>());
});

test("single api key set", () => {
	process.env["BDAPI_API_KEYS"] = "foo";
	expect(getApiKeys()).toEqual(new Set<string>(["foo"]));
});

test("many api keys set", () => {
	process.env["BDAPI_API_KEYS"] = "foo bar ; baz, biff";
	expect(getApiKeys()).toEqual(new Set<string>(["foo", "bar", "baz", "biff"]));
});

test("duplicate keys removed", () => {
	process.env["BDAPI_API_KEYS"] = "foo bar foo foo foo";
	expect(getApiKeys()).toEqual(new Set<string>(["foo", "bar"]));
});
