const getUrl = require("../../../../common/getUrl");
const { COMMON_SECONDARY_CONTENT_SUFFIX } = require("../../../../common/sendEmailData");
const LINK_LICENCE_TO_COPY = `<a href="https://www.cla.co.uk/licencetocopy">here</a>`;
const LINK_CUSTOMER_SUPPORT = `<a href="mailto:support@educationplatform.zendesk.com">Customer Support</a>`;
const SECONDARY_CONTENT = `
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
`;

const firstEmailReminderA = async function (sendEmail, email, userTitle, userSurname, url) {
	return sendEmail.sendTemplate(
		null,
		email,
		`Don't forget to secure your free registration!`,
		{
			title: ``,
			content: `Hi ${userTitle} ${userSurname}, <br/><br/>
			We recently sent you an email inviting you to set a password to complete your free registration to the CLA Education Platform. This is a service included with your CLA Copyright Licence. If you work at a state school you are covered by the licence and you can find out more about it ${LINK_LICENCE_TO_COPY} or if you're an FE college or independent school you already hold a licence with us directly.
			<br/><br/>
			It takes just a minute to complete this one-time process, then you can start to make and share copies of your favourite textbooks online whenever and wherever you want.
			<br/><br/>
			<strong>Your new 'set password' link expires in 7 days so make sure you don't miss out.</strong>
			<br/><br/>
			Secure your free registration and set your password now.`,
			cta: {
				title: `Set Password Now`,
				url: url,
			},
			secondary_content: SECONDARY_CONTENT,
		},
		null,
		"activate-reminder-1A"
	);
};

const firstEmailReminderB = async function (sendEmail, email, userTitle, userSurname, url) {
	return sendEmail.sendTemplate(
		null,
		email,
		`Don't forget to complete your registration!`,
		{
			title: ``,
			content: `Hi ${userTitle} ${userSurname}, <br/><br/>
			We recently sent you an email inviting you to set a password to complete your registration to the CLA Education Platform. This is a service included with your CLA Copyright Licence. If you work at a state school you are covered by the licence and you can find out more about it ${LINK_LICENCE_TO_COPY} or if you're an FE college or independent school you already hold a licence with us directly.
			<br></br>
			On the Education Platform you can find 1000's of digital books and magazines available to you and your school or college, giving you the flexibility to prepare lessons whenever and wherever you want. By sharing book content using Google Classroom, Teams or via your VLE you can better support remote learners.
			<br/></br>
			<strong>Set your password now and you can start to make and share copies of your favourite textbooks today.</strong>`,
			cta: {
				title: `Set Password Now`,
				url: url,
			},
			secondary_content: SECONDARY_CONTENT,
		},
		null,
		"activate-reminder-1B"
	);
};

const secondEmailReminderA = async function (sendEmail, email, userTitle, userSurname, url) {
	return sendEmail.sendTemplate(
		null,
		email,
		`Another chance to secure your free registration!`,
		{
			title: ``,
			content: `Hi ${userTitle} ${userSurname}, <br/><br/>
			We recently sent you an email reminding you to set a password to complete your free registration to the CLA Education Platform.
			This is a service included with your CLA Copyright Licence. If you work at a state school you are covered by the licence and you can find out more about it ${LINK_LICENCE_TO_COPY} or if you're an FE college or independent school you already hold a licence with us directly.
			<br/><br/>
			For security your original 'set password' link expired but we have created a new one for you, so you don't miss out on the chance to be able to access your favourite textbooks online.
			<br/><br/>
			<strong>Your new registration link will expire in 7 days so don't miss out.</strong>
			<br/><br/>
			Set your password and secure your access today.
			`,
			cta: {
				title: `Set Password Now`,
				url: url,
			},
			secondary_content: SECONDARY_CONTENT,
		},
		null,
		"activate-reminder-2A"
	);
};

const secondEmailReminderB = async function (sendEmail, email, userTitle, userSurname, url) {
	return sendEmail.sendTemplate(
		null,
		email,
		`Another chance to complete your registration!`,
		{
			title: ``,
			content: `Hi ${userTitle} ${userSurname}, <br/><br/>
			We recently sent you an email inviting you to set a password to complete your registration to the CLA Education Platform. This is a service included with your CLA Copyright Licence. If you work at a state school you are covered by the licence and you can find out more about it ${LINK_LICENCE_TO_COPY} or if you're an FE college or independent school you already hold a licence with us directly.
			<br/><br/>
			For security your original 'set password' link expired but we have created a new one for you below, so you don't miss out on the chance to be able to access your favourite text-books online.
			<br/><br/>
			Give yourself the flexibility to prepare lessons whenever and wherever you want and share book content with students using Google classroom, Teams or via your VLE.
			<br/><br/>
			<strong>Set your password now and you can start to make and share copies of your favourite textbooks today.</strong>`,
			cta: {
				title: `Set Password Now`,
				url: url,
			},
			secondary_content: SECONDARY_CONTENT,
		},
		null,
		"activate-reminder-2B"
	);
};

const thirdEmailReminderA = async function (sendEmail, email, userTitle, userSurname) {
	return sendEmail.sendTemplate(
		null,
		email,
		`You can still rescue your Education Platform registration`,
		{
			title: ``,
			content: `Hi ${userTitle} ${userSurname}, <br/><br/>
			We recently sent you an email reminding you to set a password to complete your free registration to the CLA Education Platform.
			<br/><br>
			This is a service included with your CLA Copyright Licence. If you work at a state school you are covered by the licence and you can find out more about it ${LINK_LICENCE_TO_COPY} or if you're an FE college or independent school you already hold a licence with us directly. Your licence gives you access to your favourite textbooks online.
			<br/><br>
			For security the personal registration links we previously sent have expired, but you can still complete your account set-up by following the steps on the Education Platform 'Reset Password' page at any time.
			<br/><br/>`,
			cta: {
				title: `Reset Password`,
				url: getUrl("/auth/forgot-password"),
			},
			secondary_content: `Alternatively you can contact ${LINK_CUSTOMER_SUPPORT} and we can help you to register.
			<br/><br/>
			<strong>Don't miss this chance to complete your registration today.</strong>
			<br/><br/>
			${SECONDARY_CONTENT}`,
		},
		null,
		"activate-reminder-3A"
	);
};

const thirdEmailReminderB = async function (sendEmail, email, userTitle, userSurname) {
	return sendEmail.sendTemplate(
		null,
		email,
		`You can still rescue your Education Platform registration`,
		{
			title: ``,
			content: `Hi ${userTitle} ${userSurname}, <br/><br/>
			We recently sent you an email reminding you to set a password to complete your free registration to the CLA Education Platform.
			<br/><br/>
			This is a service included with your CLA Copyright Licence. If you work at a state school you are covered by the licence and you can find out more about it ${LINK_LICENCE_TO_COPY} or if you're an FE college or independent school you already hold a licence with us directly. Your licence gives you access to your favourite textbooks online.
			<br/><br/>
			For security the personal registration links we previously sent have expired, but you can still complete your account set-up by following the steps on the Education Platform 'Reset Password' page at any time.
			<br/><br/>`,
			cta: {
				title: `Reset Password`,
				url: getUrl("/auth/forgot-password"),
			},
			secondary_content: `Alternatively you can contact ${LINK_CUSTOMER_SUPPORT} and we can help you to register. <br/><br/>
			<strong>Complete your registration today.</strong>
			<br/><br/>
			${SECONDARY_CONTENT}`,
		},
		null,
		"activate-reminder-3B"
	);
};

module.exports = {
	firstEmailReminderA,
	firstEmailReminderB,
	secondEmailReminderA,
	secondEmailReminderB,
	thirdEmailReminderA,
	thirdEmailReminderB,
};
