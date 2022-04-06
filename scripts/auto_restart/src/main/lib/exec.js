const childProcess = require("child_process");
const shellQuote = require("shell-quote").quote;

module.exports = (cmd, args, cwd) => new Promise((resolve, reject) => {
	if (args) {
		cmd = cmd + ' ' + shellQuote(args);
	}
	const child = childProcess.exec(cmd, { cwd: cwd, stdio: 'inherit' });
	child.stderr.pipe(process.stderr);
	child.stdout.pipe(process.stdout);
	child.on('exit', code => {
		if (code === 0) {
			resolve();
		} else {
			reject({
				error: null,
				code: code,
			});
		}
	});
	child.on('error', err => {
		reject({
			error: err,
			code: -1,
		});
	});
});