const { execFile } = require("child_process");

module.exports = function execFilePromise(cmd, args) {
	return new Promise((resolve, reject) => {
		execFile(cmd, args, (err, stdout) => {
			if (err) {
				reject(err);
			} else {
				resolve(stdout);
			}
		});
	});
};
