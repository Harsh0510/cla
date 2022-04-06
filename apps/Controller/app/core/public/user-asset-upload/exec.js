const childProcess = require("child_process");

const shellQuote = require("shell-quote").quote;

module.exports = (cmd, args) => {
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
