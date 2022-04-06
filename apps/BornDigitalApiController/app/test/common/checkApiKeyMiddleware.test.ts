import { jest, expect, test } from "@jest/globals";
import { Context } from "koa";

import checkApiKeyMiddleware from "../../src/common/checkApiKeyMiddleware";

jest.mock("../../src/common/getApiKeys", () => {
	return () => new Set(["foo", "bar"]);
});

const getCtx = (key: string | null): Context =>
	({
		request: {
			headers: {
				"x-auth": key,
			},
		},
	} as unknown as Context);

test("no key provided", async () => {
	let count = 0;
	let e = false;
	try {
		await checkApiKeyMiddleware(getCtx(null), async () => {
			++count;
		});
	} catch {
		e = true;
	}
	expect(e).toBe(true);
	expect(count).toBe(0);
});

test("invalid key", async () => {
	let count = 0;
	let e = false;
	try {
		await checkApiKeyMiddleware(getCtx("invalid key!!"), async () => {
			++count;
		});
	} catch {
		e = true;
	}
	expect(e).toBe(true);
	expect(count).toBe(0);
});

test("valid key", async () => {
	let count = 0;
	let e = false;
	try {
		await checkApiKeyMiddleware(getCtx("foo"), async () => {
			++count;
		});
	} catch {
		e = true;
	}
	expect(e).toBe(false);
	expect(count).toBe(1);
});
