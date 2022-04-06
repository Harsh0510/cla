const fs = require("fs-extra");

module.exports = async dir => {
	if (!dir) {
		return;
	}
	try {
		await fs.remove(dir);
	} catch (e) {

	}
}