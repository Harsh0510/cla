import { expect, test, jest, beforeEach } from "@jest/globals";
import TJsonValue from "../../src/common/TJsonValue";

let mockQueryArgs: TJsonValue[] = [];

jest.mock("../../src/common/db", () => {
	return {
		query(text: string, binds: TJsonValue[]) {
			mockQueryArgs.push([text, binds]);
		},
	};
});

import log from "../../src/common/log";

beforeEach(() => {
	mockQueryArgs = [];
});

test("success - all values given", async () => {
	await log({
		message: "a",
		api_key: "b",
		exception_message: "c",
		exception_stack: "d",
		extract_id: 1,
		http_request_body: "e",
		http_response_body: "f",
		http_status: 250,
		ip_address: "1.2.3.4",
		request_id: "g",
		time_taken_ms: 500,
		url: "https://google.com",
		user_agent: "h",
	});
	expect((mockQueryArgs[0] as TJsonValue[])[1]).toEqual([
		"a",
		"b",
		250,
		"e",
		"f",
		"https://google.com",
		500,
		"g",
		"1.2.3.4",
		"h",
		1,
		"c",
		"d",
	]);
});

test("success - minimal values", async () => {
	await log({
		message: "a",
	});
	expect((mockQueryArgs[0] as TJsonValue[])[1]).toEqual([
		"a",
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
	]);
});
