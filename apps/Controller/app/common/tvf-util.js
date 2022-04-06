const util = require("util");
const crypto = require("crypto");

const genRandomBytes = util.promisify(crypto.randomBytes);

function sqlToJsTimestamp(sqlDate) {
	// Example input: 2018-11-11T11:13:20.584Z
	const parts = sqlDate.split(/[^0-9]/g);
	const [year, month, day, hour, minutes, seconds, millis] = parts;
	return Date.UTC(
		parseInt(year, 10),
		parseInt(month, 10) - 1,
		parseInt(day, 10),
		parseInt(hour, 10),
		parseInt(minutes, 10),
		parseInt(seconds, 10),
		parseInt(millis, 10)
	);
}

function sqlToJsDate(sqlDate) {
	return new Date(sqlToJsTimestamp(sqlDate));
}

module.exports = {
	async generateObjectIdentifier() {
		const randomBytesBuffer = await genRandomBytes(18);
		return randomBytesBuffer.toString("hex");
	},
	passwordIsStrong(pw) {
		if (typeof pw !== "string") {
			return false;
		}
		if (pw.length < 8) {
			return false;
		}
		if (!pw.match(/[a-z]/)) {
			return false;
		}
		if (!pw.match(/[A-Z]/)) {
			return false;
		}
		if (!pw.match(/[0-9]/)) {
			return false;
		}
		if (!pw.match(/\W/)) {
			return false;
		}
		return true;
	},
	sqlToJsTimestamp,
	sqlToJsDate,
};
