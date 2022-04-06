const getUrl = require("../../../common/getUrl");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../common/sendEmailData");

module.exports = function (sendEmail, email, token, userTitle, userSurname, localSchoolName) {
	const url = getUrl(`/auth/activate/${token}`);

	return sendEmail.sendTemplate(
		null,
		email,
		`Start copying your books on CLA's Education Platform!`,
		{
			title: ``,
			content: `Dear ${userTitle} ${userSurname} <br/><br/>
${localSchoolName} has given you FREE access to the <a href="${getUrl()}" target="_blank">Education Platform</a>, a new service included with the <a href="https://cla.co.uk/licencetocopy">CLA copyright licence</a> and paid for by the Department for Education.
<br/><br/>
The Education Platform gives you access to digital versions of books that your school or college owns so you can make copies for teaching. Copies can be shared digitally with students making the Education Platform ideal for remote teaching: <a href="${getUrl(
				"/about"
			)}">Education Platform</a>
<br/><br/>
You have been given a provisional user account – just set a password to complete your registration.`,

			cta: {
				title: `Set Password Now`,
				url: url,
			},

			secondary_content: `
			<h3>What if I have a question?</h3>

			We offer support to users through a dedicated <a href="mailto:support@educationplatform.zendesk.com">Customer Support team</a> and we can help you with any queries you might have with this registration process. Once signed up we can help you to find books that you use in the classroom and guide you to ensure that you get the most out of the Platform. You can also access our <a href="https://educationplatform.zendesk.com/hc/en-us">Knowledgebase</a> for more information about how it all works.
			
			<br/><br/>
			
			If you would like to know more about the CLA copyright licence that applies to your institution please visit <a href="https://cla.co.uk/licencetocopy">https://cla.co.uk/licencetocopy</a>
			<br/><br/>

			We hope you enjoy using the Education Platform to support your teaching; if you like it please tell your colleagues!

			${COMMON_SECONDARY_CONTENT_SUFFIX}

			<br/><br/>
			Regards
			<br/><br/>

			Education Platform Customer Support
			<br/><br/>
			Education Platform is on twitter <a href="https://twitter.com/EduPlatformUK">@EduPlatformUK</a>
			`,
		},
		null,
		"activate"
	);
};
