import { exec as execOrig, ExecException, ExecOptions } from "child_process";
import shellQuote from "shell-quote";

export const exec = (cmd: string, args?: string[], options?: ExecOptions): Promise<string | Buffer> =>
	new Promise((resolve, reject) => {
		let str = cmd;
		if (args) {
			str += " " + shellQuote.quote(args);
		}
		execOrig(str, options, (err: ExecException | null, stdout: string | Buffer) => {
			if (err) {
				reject(err);
			} else {
				resolve(stdout);
			}
		});
	});

export const execAlwaysSucceed = (
	cmd: string,
	args?: string[],
	options?: ExecOptions
): Promise<{ status: number | undefined; stdout: Buffer | string; stderr: Buffer | string }> =>
	new Promise((resolve) => {
		let str = cmd;
		if (args) {
			str += " " + shellQuote.quote(args);
		}
		execOrig(str, options, (err: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) => {
			resolve({
				status: err ? err.code : 0,
				stdout: stdout,
				stderr: stderr,
			});
		});
	});
