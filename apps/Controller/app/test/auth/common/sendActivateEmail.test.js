const sendActivateEmail = require("../../../core/auth/common/sendActivateEmail");

let sendEmail, email, mockFrom, mockTo, mockSubject, mockBody, mockUserTitle, mockUserSurname, mockToken;

function resetAll() {
	email = "foo@email.com";

	mockFrom = null;
	mockTo = "foo@email.com";
	mockSubject = `Start copying your books on CLA's Education Platform!`;
	mockUserTitle = "john";
	mockUserSurname = "ville";
	mockToken = "e84cae3fe435bc26f67328f395e3043d0668";

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

test("function returns true", async () => {
	expect(sendActivateEmail(sendEmail, email, mockToken, mockUserTitle, mockUserSurname)).toEqual(true);
});

test("function returns false when to email not passed", async () => {
	expect(sendActivateEmail(sendEmail, "", mockToken, mockUserTitle, mockUserSurname)).toEqual(false);
});
