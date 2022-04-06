import { execFile, ExecFileException } from "child_process";

export default (fp: string, args: string[]): Promise<string | Buffer> =>
	new Promise((resolve, reject) => {
		execFile(fp, args, { maxBuffer: 256 * 1024 * 1024 }, (err: ExecFileException | null, stdout: string) => {
			if (err) {
				reject(err);
			} else {
				resolve(stdout);
			}
		});
	});
