const exec = require("./exec");

module.exports = async (imagePath) => {
	let res;
	try {
		res = await exec("identify", ["-format", "%m", imagePath]);
	} catch (e) {
		return null;
	}
	return res.toString();
};
