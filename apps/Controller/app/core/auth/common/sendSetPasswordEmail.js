const getUrl = require("../../../common/getUrl");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../common/sendEmailData");

const secondaryContent =
	`For your security, this link will expire in 72 hours.<br/>If you need help completing registration, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = function (sendEmail, email, token, userTitle, userSurname) {
	const url = getUrl(`/auth/set-password/${token}`);
	return sendEmail.sendTemplate(
		null,
		email,
		`Your Education Platform Account Has Been Approved`,
		{
			content: `Hello ${userTitle} ${userSurname},<br/><br/>The administrator has approved your request for an account on the Education Platform.<br/>Please click on the link below to set a password.`,
			cta: {
				title: `Set your password`,
				url: url,
			},
			secondary_content: secondaryContent,
		},
		null,
		"set-password"
	);
};
