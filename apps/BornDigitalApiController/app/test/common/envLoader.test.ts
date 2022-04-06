import { expect, describe, test, jest, beforeEach, afterEach } from "@jest/globals";
import { DotenvConfigOptions } from "dotenv";

let mockExistsSync: (p: string) => boolean = () => false;

jest.mock("fs", () => {
	return {
		existsSync(p: string) {
			return mockExistsSync(p);
		},
	};
});

let mockConfigResult: (opts?: DotenvConfigOptions) => object | null = () => null;

jest.mock("dotenv", () => {
	return {
		config(options?: DotenvConfigOptions) {
			return mockConfigResult(options);
		},
	};
});

const origProcessEnv = { ...process.env };

beforeEach(() => {
	mockExistsSync = (p: string) => p === "/foo/bar/.env";
	mockConfigResult = () => null;
});

afterEach(() => {
	process.env = { ...origProcessEnv };
});

import { getDotEnvFilePath, loadEnvVars } from "../../src/common/envLoader";

describe("getDotEnvFilePath", () => {
	test("finds env file in directory provided", () => {
		expect(getDotEnvFilePath("/foo/bar")).toBe("/foo/bar/.env");
		expect(getDotEnvFilePath("/foo/bar/")).toBe("/foo/bar/.env");
	});
	test("finds env file on upper path", () => {
		expect(getDotEnvFilePath("/foo/bar/a/b/c")).toBe("/foo/bar/.env");
		expect(getDotEnvFilePath("/foo/bar/a/b/c/")).toBe("/foo/bar/.env");
	});
	test("finds env file at root path", () => {
		mockExistsSync = (p: string) => p === "/.env";
		expect(getDotEnvFilePath("/foo/bar/a/b/c")).toBe("/.env");
		expect(getDotEnvFilePath("/foo/bar/a/b/c/")).toBe("/.env");
	});
	test("finds env file at root path when starting at root path", () => {
		mockExistsSync = (p: string) => p === "/.env";
		expect(getDotEnvFilePath("/")).toBe("/.env");
	});
	test("not found", () => {
		mockExistsSync = () => false;
		expect(getDotEnvFilePath("/foo/bar/a/b/c")).toBe(null);
		expect(getDotEnvFilePath("/foo/bar/a/b/c/")).toBe(null);
	});
});

describe("loadEnvVars", () => {
	test("fails - no path found", () => {
		process.env = {};
		mockExistsSync = () => false;
		loadEnvVars("/foo/bar/baz");
		expect(process.env).toEqual({});
	});
	test("fails - parsing fails", () => {
		process.env = {};
		mockExistsSync = () => true;
		mockConfigResult = () => null;
		loadEnvVars("/foo/bar/baz");
		expect(process.env).toEqual({});
	});
	test("succeeds", () => {
		process.env = {};
		mockExistsSync = () => true;
		mockConfigResult = (opts) => ({ parsed: opts });
		loadEnvVars("/foo/bar/baz");
		expect(process.env).toEqual({
			path: "/foo/bar/baz/.env",
		});
	});
});
