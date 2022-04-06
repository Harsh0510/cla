import path from "path";
import crypto from "crypto";
import os from "os";

import fs from "fs-extra";

import { exec, execAlwaysSucceed } from "../exec";

export const diff = async (url: string, revision1: string, revision2: string) => {
	const rnd = crypto.randomBytes(16).toString("hex");
	const tmpBase = path.join(os.tmpdir(), "bdapi_gitdiff_" + rnd);
	const tmpBase1 = path.join(tmpBase, "git1");
	const tmpBase2 = path.join(tmpBase, "git2");
	await fs.mkdirp(tmpBase1);
	await fs.mkdirp(tmpBase2);

	await exec("git", ["clone", url, tmpBase1]);
	await fs.copy(tmpBase1, tmpBase2);
	await exec("git", ["checkout", revision1], { cwd: tmpBase1 });
	await exec("git", ["checkout", revision2], { cwd: tmpBase2 });

	const result = await execAlwaysSucceed("diff", [
		"-rq",
		"--speed-large-files",
		"-x",
		".svn",
		"-x",
		".git",
		tmpBase1,
		tmpBase2,
	]);
	const lines = result.stdout.toString().trim().split(/[\n]+/g);
	const ret: [string | null, string][] = [];
	for (const line of lines) {
		{
			const matches = line.match(/^Files (.+?) and (.+?) differ$/);
			if (matches) {
				ret.push([matches[1] as string, matches[2] as string]);
				continue;
			}
		}
		{
			const matches = line.match(/^Only in (.+?): (.+?)$/);
			if (matches) {
				const p = path.join(matches[1] as string, matches[2] as string);
				if (p.indexOf(tmpBase2) === 0) {
					ret.push([null, p]);
				}
				continue;
			}
		}
		throw new Error("should never get here: " + line);
	}
	return ret;
};
