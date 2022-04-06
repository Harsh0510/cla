const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const mjml = require("mjml");
const dot = require("dot");

const getUrl = require("./getUrl");
const smtpServerDetails = require("./smtpServerDetails");
const getWithUtmParams = require("./getWithUtmParams");

const overrideEmailTo = (() => {
	if (!process.env.SEND_ALL_EMAILS_TO) {
		return null;
	}
	const parts = process.env.SEND_ALL_EMAILS_TO.trim().split(/[\s\r\n\t;]+/);
	const emails = parts.map((p) => p.trim()).filter((p) => !!p);
	if (!emails.length) {
		return null;
	}
	if (emails.length === 1) {
		return emails[0];
	}
	return emails;
})();

module.exports = class EmailClient {
	constructor(user, password, host) {
		this.server = nodemailer.createTransport({
			host: host || smtpServerDetails.host,
			secure: true,
			port: 465,
			auth: {
				user: user || smtpServerDetails.userName,
				pass: password || smtpServerDetails.password,
			},
		});
		const tmplFilePath = path.join(__dirname, "..", "emails", "template.mjml");
		this._tmpl = dot.compile(
			mjml(fs.readFileSync(tmplFilePath).toString(), {
				minify: true,
				validationLevel: "strict",
				filePath: tmplFilePath,
			}).html
		);
		if (process.env.CLA_BLOB_STORAGE_URL) {
			this._imageBaseUrl = process.env.CLA_BLOB_STORAGE_URL + "/emails";
		} else if (process.env.CLA_FALLBACK_BLOB_STORAGE_ACCOUNT) {
			this._imageBaseUrl = process.env.CLA_FALLBACK_BLOB_STORAGE_ACCOUNT + "/emails";
		} else {
			this._imageBaseUrl = path.join(__dirname, "..", "emails");
		}
		this._baseUrl = getUrl();
	}

	sendTemplate(from, to, subject, data, attachment, category) {
		let sendData;
		if (typeof data === "string") {
			sendData = {
				content: data,
			};
		} else {
			sendData = data || {};
		}
		sendData.baseUrl = this._baseUrl;
		sendData.imageBaseUrl = this._imageBaseUrl;
		sendData.title = data && data.title ? data.title : subject;
		if (typeof sendData.icon === "undefined") {
			sendData.icon = "reset-password";
		}
		let headers;
		const cat = data.category || category;
		let catArr = cat ? (Array.isArray(cat) ? cat : [cat]) : null;
		let htmlBody = this._tmpl(sendData);
		if (catArr) {
			headers = {
				"X-SMTPAPI": JSON.stringify({
					category: catArr,
				}),
			};
			htmlBody = getWithUtmParams(htmlBody, catArr[0]);
		}

		return this.send(from, to, subject, htmlBody, attachment, headers);
	}

	send(from, to, subject, htmlBody, attachment, headers) {
		if (overrideEmailTo) {
			subject += ` [originally sent to: ${to}]`;
			to = overrideEmailTo;
		}
		if (process.env.SEND_ALL_EMAILS_FROM) {
			from = process.env.SEND_ALL_EMAILS_FROM;
		}
		if (!from) {
			from = process.env.DEFAULT_SEND_EMAILS_FROM;
		}
		let attachments = [];
		if (attachment) {
			if (Array.isArray(attachment)) {
				attachment.forEach((file) => {
					attachments.push(file);
				});
			} else if (typeof attachment === "object") {
				attachments.push(attachment);
			}
		}
		const params = {
			from: from,
			to: to,
			subject: subject,
			html: htmlBody,
			attachments: attachments,
		};
		if (headers) {
			params.headers = headers;
		}
		return this.server.sendMail(params);
	}
};
