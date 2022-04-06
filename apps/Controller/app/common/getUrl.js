module.exports = function (suffix) {
	let base = "";
	if (process.env.CLA_BASE_URL) {
		base = process.env.CLA_BASE_URL;
	} else if (process.env.IS_AZURE) {
		base = "https://www.educationplatform.co.uk";
	} else {
		base = "http://localhost:16000";
	}
	if (typeof suffix === "string") {
		return base + suffix;
	}
	return base;
};
