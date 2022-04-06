const path = require("path");
const os = require("os");
const crypto = require("crypto");
const stream = require("stream");
const util = require("util");

const fs = require("fs-extra");
const axios = require("axios");

const getImageFileType = require("./getImageFileType");

const streamFinished = util.promisify(stream.finished);

module.exports = async (url) => {
	const tmpPath = path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"));
	const writer = fs.createWriteStream(tmpPath);
	await axios({
		method: "get",
		url: url,
		responseType: "stream",
	}).then((response) => {
		response.data.pipe(writer);
		return streamFinished(writer);
	});
	if (!(await getImageFileType(tmpPath))) {
		await fs.remove(tmpPath);
		throw new Error("invalid image");
	}
	return tmpPath;
};
