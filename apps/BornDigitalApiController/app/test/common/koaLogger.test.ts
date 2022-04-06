import { expect, test, jest, beforeEach, afterEach } from "@jest/globals";
import { ILogParams } from "../../src/common/log";

const origProcessEnv = { ...process.env };

let mockCurrentTimeMs = 1000;

const makeFakeKoaContext = () => {
	return {
		originalUrl: "https://google.com",
		request: {
			headers: {
				"x-client-ip": "1.2.3.4",
				"x-auth": "xxx",
				"user-agent": "yyy",
			},
			ip: "2.3.4.5",
		},
		status: 234,
		_rawBody: "raw body here",
		response: {
			body: "foo",
		},
		res: {
			once(name: string, cb: (name: string) => void) {
				if (name === "close") {
					cb(name);
				}
			},
			removeListener() {
				("");
			},
		},
	};
};

jest.mock("crypto", () => {
	return {
		randomBytes(len: number) {
			return "a".repeat((len * 4) / 3);
		},
	};
});

let mockLogArgs: ILogParams[] = [];

jest.mock("../../src/common/log.ts", () => {
	return (params: ILogParams) => {
		mockLogArgs.push(params);
	};
});

const RealDate = Date;

beforeEach(() => {
	mockCurrentTimeMs = 1000;
	global.Date.now = () => mockCurrentTimeMs;
	mockLogArgs = [];
});

afterEach(() => {
	global.Date.now = RealDate.now;
	process.env = { ...origProcessEnv };
});

import koaLogger from "../../src/common/koaLogger";
import koa from "koa";
import createHttpError from "http-errors";

test("logs on success - not azure", async () => {
	const ctx = makeFakeKoaContext();
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: "2.3.4.5",
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: "foo",
			ip_address: "2.3.4.5",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on success - no user-agent", async () => {
	const ctx = makeFakeKoaContext();
	ctx.request.headers["user-agent"] = "";
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: "2.3.4.5",
			url: "https://google.com",
			user_agent: "",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: "foo",
			ip_address: "2.3.4.5",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on success - empty x-auth", async () => {
	const ctx = makeFakeKoaContext();
	(ctx.request.headers["x-auth"] as unknown as boolean) = false;
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: null,
			http_request_body: "raw body here",
			ip_address: "2.3.4.5",
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: null,
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: "foo",
			ip_address: "2.3.4.5",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on success - on azure", async () => {
	const ctx = makeFakeKoaContext();
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	process.env["IS_AZURE"] = "1";
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: "1.2.3.4",
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: "foo",
			ip_address: "1.2.3.4",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on success - on azure, with array ip", async () => {
	const ctx = makeFakeKoaContext();
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	process.env["IS_AZURE"] = "1";
	(ctx.request.headers["x-client-ip"] as unknown as string[]) = ["2.2.3.3", "4.4.5.5"];
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: "2.2.3.3",
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: "foo",
			ip_address: "2.2.3.3",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on success - on azure, with empty array ip", async () => {
	const ctx = makeFakeKoaContext();
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	process.env["IS_AZURE"] = "1";
	(ctx.request.headers["x-client-ip"] as unknown as string[]) = [];
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: null,
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: "foo",
			ip_address: null,
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on success - no response body", async () => {
	const ctx = makeFakeKoaContext();
	(ctx.response.body as unknown as null) = null;
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: "2.3.4.5",
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: "",
			ip_address: "2.3.4.5",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on success - response body is a number", async () => {
	const ctx = makeFakeKoaContext();
	(ctx.response.body as unknown as number) = 5566;
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: "2.3.4.5",
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: "5566",
			ip_address: "2.3.4.5",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on success - response body is a boolean", async () => {
	const ctx = makeFakeKoaContext();
	(ctx.response.body as unknown as boolean) = true;
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: "2.3.4.5",
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: "true",
			ip_address: "2.3.4.5",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on success - response body is an object", async () => {
	const ctx = makeFakeKoaContext();
	(ctx.response.body as unknown as object) = {
		foo: 5,
	};
	const next = () => {
		mockCurrentTimeMs = 1234;
	};
	await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: "2.3.4.5",
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 234,
			http_request_body: "raw body here",
			http_response_body: `{"foo":5}`,
			ip_address: "2.3.4.5",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: undefined,
			exception_stack: undefined,
		},
	]);
});

test("logs on exception thrown", async () => {
	const ctx = makeFakeKoaContext();
	let stack: string | undefined;
	const next = () => {
		mockCurrentTimeMs = 1234;
		const e = createHttpError(444, "some error here");
		stack = e.stack;
		throw e;
	};
	try {
		await koaLogger(ctx as unknown as koa.Context, next as unknown as koa.Next);
	} catch {}
	expect(mockLogArgs).toEqual([
		{
			message: "start",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_request_body: "raw body here",
			ip_address: "2.3.4.5",
			url: "https://google.com",
			user_agent: "yyy",
		},
		{
			message: "end",
			request_id: "a".repeat(24),
			api_key: "xxx",
			http_status: 444,
			http_request_body: "raw body here",
			http_response_body: "foo",
			ip_address: "2.3.4.5",
			time_taken_ms: 234,
			url: "https://google.com",
			user_agent: "yyy",
			exception_message: "some error here",
			exception_stack: stack,
		},
	]);
});
