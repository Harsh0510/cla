const sendEmail = require("../../../../common/sendEmail");
const sendEmailData = require(`../../../../common/sendEmailData`);
const emailContent = sendEmailData.alertEmailUserNotCreatedCopies;
const { emailNotificationCategory } = require(`../../../../common/staticValues`);

module.exports = async function (usersData, numDays) {
	for (const user of usersData) {
		const userEmail = user.email;
		await sendEmail.sendTemplate(
			emailContent.from,
			userEmail,
			emailContent.subject,
			{
				title: emailContent.title,
				content: emailContent.body,
				secondary_content: emailContent.secondary_content,
				icon: emailContent.icon,
				cta: {
					title: emailContent.cta.title,
					url: emailContent.cta.url,
				},
			},
			null,
			emailNotificationCategory.userNotCreatedCopies + "-" + numDays
		);
	}
};
