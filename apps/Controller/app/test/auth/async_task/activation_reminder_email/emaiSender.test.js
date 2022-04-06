const emailSender = require(`../../../../core/auth/async_task/activation_reminder_email/emailSender`);

let sendEmail, email, mockFrom, mockTo, mockSubject, mockBody, mockUserTitle, mockUserSurname, mockToken;

function resetAll() {
	email = "foo@email.com";

	mockFrom = null;
	mockTo = "foo@email.com";
	mockSubject = `Start copying your books on CLA's Education Platform!`;
	mockUserTitle = "Mr.";
	mockUserSurname = "ville";
	mockUrl = "http://localhost:16000/auth/activate/e84cae3fe435bc26f67328f395e3043d0668";

	mockBody = {
		title: "",
		content:
			"Hello john ville,<br/><br/>You are nearly ready to start using the Education Platform to make copies.<br/>Please click on the link below to create a password and confirm your registration.",
		cta: {
			title: "Activate Account",
			url: "http://localhost:16000/auth/activate/e84cae3fe435bc26f67328f395e3043d0668",
		},
		secondary_content:
			'For your security, this link will expire in 72 hours.<br/>If you have difficulty, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a>.',
	};

	sendEmail = {
		sendTemplate: (from, to, subject, body) => {
			if (from === mockFrom && to === mockTo && subject === mockSubject && Object.keys(body).length === 4) {
				return true;
			}
			return false;
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("function render succesfully for first reminder email", async () => {
	expect(await emailSender.firstEmailReminderA(sendEmail, email, mockUserTitle, mockUserSurname, mockUrl)).toEqual(false);
});

test("function render succesfully for firstEmailReminderB ", async () => {
	expect(await emailSender.firstEmailReminderB(sendEmail, email, mockUserTitle, mockUserSurname, mockUrl)).toEqual(false);
});

test("function render succesfully for secondEmailReminderA", async () => {
	expect(await emailSender.secondEmailReminderA(sendEmail, email, mockUserTitle, mockUserSurname, mockUrl)).toEqual(false);
});

test("function render succesfully for secondEmailReminderB", async () => {
	expect(await emailSender.secondEmailReminderB(sendEmail, email, mockUserTitle, mockUserSurname, mockUrl)).toEqual(false);
});

test("function render succesfully for thirdEmailReminderA", async () => {
	expect(await emailSender.thirdEmailReminderA(sendEmail, email, mockUserTitle, mockUserSurname)).toEqual(false);
});

test("function render succesfully forthirdEmailReminderB", async () => {
	expect(await emailSender.thirdEmailReminderB(sendEmail, email, mockUserTitle, mockUserSurname)).toEqual(false);
});
