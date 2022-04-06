/**
 * based on environment variables define the sendEmail function
 */
const fs = require("fs");
const EmailClient = require("./EmailClient");

let sendEmail;

const smtpServerDetails = require("./smtpServerDetails");

if (process.env.EMAIL_WRITE_FILE) {
	sendEmail = {
		send: async (from, to, subject, htmlBody, attachment, headers) => {
			const date = new Date().toISOString();
			fs.appendFileSync(process.env.EMAIL_WRITE_FILE, JSON.stringify({ date, from, to, subject, htmlBody, headers }, null, "    ") + "\n\n");
		},
		sendTemplate: async (from, to, subject, data, attachment, category) => {
			const date = new Date().toISOString();
			fs.appendFileSync(process.env.EMAIL_WRITE_FILE, JSON.stringify({ date, from, to, subject, data, category }, null, "    ") + "\n\n");
		},
	};
} else if (smtpServerDetails.userName) {
	sendEmail = new EmailClient();
} else {
	sendEmail = {
		send: (_) => {},
		sendTemplate: (_) => {},
	};
}

module.exports = sendEmail;
