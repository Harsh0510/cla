const casync = require("async");

const queue = casync.queue((task, callback) => {
	task().finally(callback);
}, 2);

module.exports = queue;
