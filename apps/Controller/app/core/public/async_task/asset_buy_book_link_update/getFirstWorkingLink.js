const https = require("https");
const parseBuyBookRules = require("../../../../common/parseBuyBookRules");
const customAxios = require("../../../../common/customAxios");

module.exports = async function (rules, asset) {
	if (!rules) {
		return null;
	}
	let links = null;
	try {
		links = parseBuyBookRules(rules, asset);
	} catch (e) {}
	if (!links) {
		return null;
	}
	for (const link of links) {
		let success = false;
		try {
			await customAxios.head(link, {
				timeout: 12000,
				httpsAgent: new https.Agent({
					rejectUnauthorized: false,
				}),
			});
			success = true;
		} catch (e) {
			try {
				await customAxios.get(link, {
					timeout: 12000,
					httpsAgent: new https.Agent({
						rejectUnauthorized: false,
					}),
				});
				success = true;
			} catch (e) {}
		}
		if (success) {
			return link;
		}
	}
	return null;
};
