// Convert string to hex.
module.exports = function (str) {
	return Buffer.from(str, "utf8").toString("hex");
};
