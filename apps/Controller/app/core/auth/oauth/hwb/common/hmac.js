const crypto = require("crypto");

const env = require("./env");

module.exports = (str) => {
	return crypto.createHmac("sha256", env.stateSecret).update(str).digest("hex");
};
