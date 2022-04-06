const childProcess = require("child_process");

module.exports = (file, args, opts) => new Promise((resolve, reject) => {
	const child = childProcess.execFile(file, args, opts);
	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);
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