const childProcess = require("child_process");
const shellQuote = require("shell-quote").quote;

module.exports = (cmd, args) => new Promise((resolve, reject) => {
	if (args) {
		cmd = cmd + ' ' + shellQuote(args);
	}
	const child = childProcess.exec(cmd);
	let stderr = "";
	child.stderr.on("data", chunk => {
		stderr += chunk;
	});
	let stdout = "";
	child.stdout.on("data", chunk => {
		stdout += chunk;
	});
	child.on('exit', code => {
		if (code === 0) {
			resolve({
				stdout: stdout,
				stderr: stderr,
			});
		} else {
			reject({
				error: null,
				code: code,
				stderr: stderr,
			});
		}
	});
	child.on('error', err => {
		reject({
			error: err,
			code: -1,
			stderr: stderr,
		});
	});
});