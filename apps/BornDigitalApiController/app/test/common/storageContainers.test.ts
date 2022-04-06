import { expect, test, jest, beforeEach, afterEach } from "@jest/globals";

let origProcessEnv = {};

beforeEach(() => {
	jest.resetModules();
	origProcessEnv = { ...process.env };
});

afterEach(() => {
	process.env = origProcessEnv;
});

test("raw uploads - default", () => {
	delete process.env["BDAPI_AZURE_RAW_UPLOADS_CONTAINER"];

	/* eslint-disable @typescript-eslint/no-var-requires */
	const sc = require("../../src/common/storageContainers");
	/* eslint-enable @typescript-eslint/no-var-requires */

	expect(sc.rawUploads).toBe("rawuploads");
});

test("raw uploads - provided", () => {
	process.env["BDAPI_AZURE_RAW_UPLOADS_CONTAINER"] = "abc";

	/* eslint-disable @typescript-eslint/no-var-requires */
	const sc = require("../../src/common/storageContainers");
	/* eslint-enable @typescript-eslint/no-var-requires */

	expect(sc.rawUploads).toBe("abc");
});

test("extracts - default", () => {
	delete process.env["BDAPI_AZURE_EXTRACTS_CONTAINER"];

	/* eslint-disable @typescript-eslint/no-var-requires */
	const sc = require("../../src/common/storageContainers");
	/* eslint-enable @typescript-eslint/no-var-requires */

	expect(sc.extracts).toBe("borndigitalextracts");
});

test("extracts - provided", () => {
	process.env["BDAPI_AZURE_EXTRACTS_CONTAINER"] = "def";

	/* eslint-disable @typescript-eslint/no-var-requires */
	const sc = require("../../src/common/storageContainers");
	/* eslint-enable @typescript-eslint/no-var-requires */

	expect(sc.extracts).toBe("def");
});
