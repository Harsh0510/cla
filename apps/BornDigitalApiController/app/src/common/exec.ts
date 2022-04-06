import childProcess from "child_process";

import { quote as shellQuote } from "shell-quote";

export default (cmd: string, args?: string[] | undefined) => {
	if (Array.isArray(args)) {
		cmd = cmd + " " + shellQuote(args);
	}
	return new Promise((resolve, reject) => {
		childProcess.exec(cmd, (err, stdout) => {
			if (err) {
				reject(err);
			} else {
				resolve(stdout);
			}
		});
	});
};
