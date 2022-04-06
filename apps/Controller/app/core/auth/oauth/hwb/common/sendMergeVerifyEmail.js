const sendEmail = require("../../../../../common/sendEmail");
const getUrl = require("../../../../../common/getUrl");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../../../common/sendEmailData");

const secondaryContent =
	`If you are having any issues with your account, please do not hesitate to <a href="mailto:support@educationplatform.zendesk.com">contact us</a>.<br/><br/>Best wishes,<br/>CLA Education Platform Support Team` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = function (email, token) {
	const url = getUrl(`/auth/merge-verify/${token}`);
	return sendEmail.sendTemplate(
		null,
		email,
		`Education Platform - Verify yourself`,
		{
			title: "Please confirm your email address",
			content: `Thank you for opting to merge your Education Platform and Hwb accounts. Please verify your email address by clicking the link below.`,
			cta: {
				title: `Verify Account`,
				url: url,
			},
			secondary_content: secondaryContent,
		},
		null,
		"hwb-merge-verify"
	);
};
