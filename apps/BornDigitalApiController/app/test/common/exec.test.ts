import { expect, test, jest, beforeEach } from "@jest/globals";

let mockCb: (cmd: string) => string | null = () => null;

jest.mock("child_process", () => {
	return {
		exec(cmd: string, cb: (err?: string | null, out?: string | null) => void) {
			const e = mockCb(cmd);
			cb(e, cmd);
		},
	};
});

import exec from "../../src/common/exec";

beforeEach(() => {
	mockCb = () => null;
});

test("no args, success", async () => {
	const ret = await exec("cmd");
	expect(ret).toEqual("cmd");
});

test("args, success", async () => {
	const ret = await exec("cmd", ["a", "b"]);
	expect(ret).toEqual("cmd a b");
});

test("errors", async () => {
	mockCb = () => "did error!!";
	let err: string | undefined;
	try {
		await exec("cmd", ["a", "b"]);
	} catch (e) {
		err = e as string;
	}
	expect(err).toBe("did error!!");
});
