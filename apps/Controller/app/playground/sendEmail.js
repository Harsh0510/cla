process.env.SMTP_EMAIL_HOST = `smtp.sendgrid.net`;
process.env.SMTP_EMAIL_USERNAME = `apikey`;
process.env.SMTP_EMAIL_PASSWORD = `FILL_ME_IN`; // from the passwords document - check for 'Production EP SendGrid SMTP credentials'

const sendEmail = require("../common/sendEmail.js");

const fromEmail = `ftp@educationplatform.co.uk`;
const username = `FILL_ME_IN`; // ftp username
const password = `FILL_ME_IN`; // ftp password
const sendTo = [
	{
		email: "FILL_ME_IN", // email address of publisher recipient
		name: "FILL_ME_IN", // name of publisher recipient
	},
];

(async () => {
	const targets = Array.isArray(sendTo) ? sendTo : [sendTo];
	for (const target of targets) {
		await sendEmail.send(
			fromEmail, // from
			target.email, // to
			'Education Platform FTP Credentials', // subject

			// body
			`
Dear ${target.name},<br/>
<br/>
Here are your log in credentials for uploading content for the Education Platform via FTP.<br/>
<br/>
Username: ${username}<br/>
Password: ${password}<br/>
<br/>
Instructions on how to upload the content will be sent to you separately.<br/>
If you have any questions, please contact Lucy Hadfield (lucy.hadfield@cla.co.uk).<br/>
<br/>
Best wishes,<br/>
Lucy
		`.trim(),
			null,
			{
				"X-SMTPAPI": JSON.stringify({
					category: ["ep_publisher_ftp_credentials"],
				}),
			}
		);
		console.log("Email successfully sent to: " + target.name + " <" + target.email + ">");
	}
})();