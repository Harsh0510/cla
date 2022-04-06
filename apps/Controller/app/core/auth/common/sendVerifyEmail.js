const getUrl = require("../../../common/getUrl");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../common/sendEmailData");

const secondaryContent =
	`If you need help completing your registration, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = function (sendEmail, email, token) {
	const url = getUrl(`/auth/verify/${token}`);
	return sendEmail.sendTemplate(
		null,
		email,
		`We Just Need To Check Something`,
		{
			content: `You are receiving this email because you recently applied to use The Education Platform.<br/>Please click on the link below to verify your email so your institution admin user can create your account.`,
			cta: {
				title: `Verify Account`,
				url: url,
			},
			secondary_content: secondaryContent,
		},
		null,
		"verify"
	);
};
