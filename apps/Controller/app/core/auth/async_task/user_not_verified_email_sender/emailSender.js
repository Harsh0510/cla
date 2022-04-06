const sendEmail = require("../../../../common/sendEmail");
const sendEmailData = require(`../../../../common/sendEmailData`);
const constants = require(`./constants`);
const getUrl = require("../../../../common/getUrl");

module.exports = async function (usersData, hours) {
	let emailContent = sendEmailData.alertEmailUserNotVerified;
	let constantHours = constants.hours;
	switch (hours) {
		case constantHours[0]:
			emailContent = sendEmailData.alertEmailUserNotVerified_17_Days;
			break;
		case constantHours[1]:
			emailContent = sendEmailData.alertEmailUserNotVerified_10_Days;
			break;
		default:
			emailContent = sendEmailData.alertEmailUserNotVerified;
	}

	for (const user of usersData) {
		const userEmail = user.email;
		let prefix = "";
		if (user.has_password) {
			prefix = "approved-";
		}
		let link_url = getUrl(`/auth/${prefix}verify/${user.activation_token}`);
		await sendEmail.sendTemplate(
			emailContent.from,
			userEmail,
			emailContent.subject,
			{
				title: emailContent.title,
				content: emailContent.body,
				secondary_content: emailContent.secondary_content,
				cta: {
					title: emailContent.cta.title,
					url: link_url,
				},
			},
			null,
			"user-not-verified"
		);
	}
};
