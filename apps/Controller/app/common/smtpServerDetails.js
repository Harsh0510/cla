const IS_PRODUCTION = require("./isProduction");

if (!IS_PRODUCTION) {
	try {
		require("./_smtp_server_details");
	} catch (e) {}
}

const details = Object.create(null);
details.userName = process.env.SMTP_EMAIL_USERNAME;
details.password = process.env.SMTP_EMAIL_PASSWORD;
details.host = process.env.SMTP_EMAIL_HOST;

module.exports = details;
