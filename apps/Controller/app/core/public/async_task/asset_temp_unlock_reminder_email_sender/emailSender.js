const getUrl = require("../../../../common/getUrl");
const sendEmail = require("../../../../common/sendEmail");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../../common/sendEmailData");

const secondaryContent =
	`If you need help with the Platform, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.<br/><br/>Follow us on Twitter <a href="https://twitter.com/eduplatformuk" target="_blank">@EduPlatformUK</a>` +
	COMMON_SECONDARY_CONTENT_SUFFIX;

module.exports = async function (usersData) {
	for (const user of usersData) {
		await sendEmail.sendTemplate(
			null,
			user.email,
			`Temporarily unlocked book ${user.pdf_isbn13}`,
			{
				content: `Dear ${user.first_name},<br /><br />The temporary unlock of ${user.title} (${user.pdf_isbn13}) is expiring in ${user.date_diff_days} days.<br /><br />Please unlock this title using a physical copy to continue to have access to the content.`,
				cta: {
					title: "Unlock now",
					url: getUrl("/unlock"),
				},
				secondary_content: secondaryContent,
			},
			null,
			"reminder-to-unlock"
		);
	}
};
