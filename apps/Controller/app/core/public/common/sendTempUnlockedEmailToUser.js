const { rawToNiceDate } = require("../../../common/date");
const sendEmail = require("../../../common/sendEmail");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../common/sendEmailData");

const secondaryContent =
	`If you need help with the Platform, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.<br/><br/>Follow us on Twitter <a href="https://twitter.com/eduplatformuk" target="_blank">@EduPlatformUK</a>` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = function (email, firstName, assetTitle, isbn, expiryDate) {
	const formatedExpiryDate = rawToNiceDate(expiryDate);
	return sendEmail.sendTemplate(
		null,
		email,
		`You have temporarily unlocked ${isbn}`,
		{
			title: null,
			content: `Dear ${firstName},<br/><br/>You have temporarily unlocked the title, ${assetTitle} (${isbn}).<br/><br/>This title is now available for you to make copies until ${formatedExpiryDate}. You will need to unlock this title using a physical copy of the book to continue to have access to the content and any copies you create from it.`,
			cta: null,
			secondary_content: secondaryContent,
		},
		null,
		"temp-unlocked-confirmed"
	);
};
