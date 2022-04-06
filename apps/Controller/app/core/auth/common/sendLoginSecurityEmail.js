const getUrl = require("../../../common/getUrl");
const { emailNotificationCategory } = require("../../../common/staticValues");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../common/sendEmailData");

const secondaryContent =
	`If you believe these logins weren't you, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.<br/><br/>Follow us on Twitter <a href="https://twitter.com/eduplatformuk" target="_blank">@EduPlatformUK</a>` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = function (sendEmail, email, firstName, token) {
	const url = getUrl(`/auth/disable-security-emails/${token}`);
	const greeting = firstName ? `Hello ${firstName},<br/><br/>` : "";
	return sendEmail.sendTemplate(
		null,
		email,
		`Education Platform: Did you just log in with a different device?`,
		{
			content: `${greeting}We noticed a login to the Education Platform from an unfamiliar computer or device recently.<br/><br/>If you have logged in to the Platform from a different device or changed your web browser, please click the button to confirm that it was you.`,
			cta: {
				title: `Yes, it was me`,
				url: url,
			},
			secondary_content: secondaryContent,
		},
		null,
		emailNotificationCategory.multipleLoginsDetected
	);
};
