const getUrl = require("../../../common/getUrl");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../common/sendEmailData");

const secondaryContent =
	`If you need help completing your registration, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.<br/><br/>Follow us on Twitter <a href="https://twitter.com/eduplatformuk" target="_blank">@EduPlatformUK</a>` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = function (sendEmail, email, token, firstName) {
	const url = getUrl(`/auth/approved-verify/${token}`);
	return sendEmail.sendTemplate(
		null,
		email,
		`Education Platform: Please confirm your email address`,
		{
			title: `Education Platform: Please confirm your email address`,
			content: `Hello ${firstName},
<br/><br/>
Please click the link below to confirm that your email address is correct.
<br/><br/>
Your request will then be sent for approval by the Education Platform administrator at your institution or the CLA; once that is done you will be able to make copies and have full access to the Platform.
<br/><br/>
For your security, this link will expire in three days.`,
			cta: {
				title: `Confirm email address`,
				url: url,
			},
			secondary_content: secondaryContent,
		},
		null,
		"verify"
	);
};
