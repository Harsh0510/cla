const path = require("path");
const os = require('os');
const crypto = require("crypto");

module.exports = prefix => {
	const buf = Buffer.alloc(16);
	const rand = crypto.randomFillSync(buf).toString('hex');
	return path.join(os.tmpdir(), `${prefix || 'cla-asset-upload-tmp'}-${rand}`);
};