const getUrl = require("../../../common/getUrl");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../common/sendEmailData");

const secondaryContent =
	`If you need help with the Platform, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.<br/><br/>Follow us on Twitter <a href="https://twitter.com/eduplatformuk" target="_blank">@EduPlatformUK</a>` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = function (sendEmail, email, firstName, schoolName) {
	return sendEmail.sendTemplate(
		null,
		email,
		`Get started on the Education Platform`,
		{
			title: `Welcome to the Education Platform`,
			content: `Hello ${firstName},
<br/><br/>
You can now use the Education Platform to help save time in teaching preparation and use ${schoolName}'s books to make copies under the CLA Education Licence.
<br/><br/>
You can find and unlock books, make copies, and share them right away.`,
			cta: {
				title: `Get started`,
				url: getUrl(),
			},
			secondary_content: secondaryContent,
		},
		null,
		"post-approval"
	);
};
