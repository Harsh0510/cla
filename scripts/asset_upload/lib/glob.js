const glob = require("glob");

module.exports = (...args) => new Promise((resolve, reject) => glob(...args, (err, result) => {
	if (err) {
		reject(err);
	} else {
		resolve(result);
	}
}));