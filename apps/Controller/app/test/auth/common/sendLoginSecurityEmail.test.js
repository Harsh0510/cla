const deepEqual = require("fast-deep-equal");

const sendLoginSecurityEmail = require("../../../core/auth/common/sendLoginSecurityEmail");

let sendEmail, mockFrom, mockTo, mockSubject, mockBody, firstName;

const fakeToken = "aaabbbccc";

function resetAll() {
	mockFrom = null;
	mockTo = "foo@email.com";
	mockSubject = "Education Platform: Did you just log in with a different device?";
	mockBody = {
		content:
			"We noticed a login to the Education Platform from an unfamiliar computer or device recently.<br/><br/>If you have logged in to the Platform from a different device or changed your web browser, please click the button to confirm that it was you.",
		cta: {
			title: "Authorise Attempts",
			url: "http://localhost:16000/auth/disable-security-emails/" + fakeToken,
		},
		secondary_content:
			'If you believe these logins weren\'t you, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.',
	};

	sendEmail = {
		sendTemplate: (from, to, subject, body) => {
			return from === mockFrom && to === mockTo && subject === mockSubject && deepEqual(body, mockBody);
		},
	};
	firstName = "abc";
}

beforeEach(resetAll);
afterEach(resetAll);

test("executes correctly with first name", async () => {
	mockFrom = null;
	mockTo = "foo@bar.com";
	mockSubject = "Education Platform: Did you just log in with a different device?";
	mockBody = {
		content:
			"Hello Bob,<br/><br/>We noticed a login to the Education Platform from an unfamiliar computer or device recently.<br/><br/>If you have logged in to the Platform from a different device or changed your web browser, please click the button to confirm that it was you.",
		cta: {
			title: "Yes, it was me",
			url: "http://localhost:16000/auth/disable-security-emails/" + fakeToken,
		},
		secondary_content: `If you believe these logins weren't you, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.<br/><br/>Follow us on Twitter <a href="https://twitter.com/eduplatformuk" target="_blank">@EduPlatformUK</a><br/><br/> To manage the notifications and emails you receive from us, login to the <a href="http://localhost:16000/profile/my-details">My Details page</a>.`,
	};
	expect(sendLoginSecurityEmail(sendEmail, "foo@bar.com", "Bob", fakeToken)).toEqual(true);
});

test("executes correctly without first name", async () => {
	mockFrom = null;
	mockTo = "foo@bar.com";
	mockSubject = "Education Platform: Did you just log in with a different device?";
	mockBody = {
		content:
			"We noticed a login to the Education Platform from an unfamiliar computer or device recently.<br/><br/>If you have logged in to the Platform from a different device or changed your web browser, please click the button to confirm that it was you.",
		cta: {
			title: "Yes, it was me",
			url: "http://localhost:16000/auth/disable-security-emails/" + fakeToken,
		},
		secondary_content: `If you believe these logins weren't you, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.<br/><br/>Follow us on Twitter <a href="https://twitter.com/eduplatformuk" target="_blank">@EduPlatformUK</a><br/><br/> To manage the notifications and emails you receive from us, login to the <a href="http://localhost:16000/profile/my-details">My Details page</a>.`,
	};
	expect(sendLoginSecurityEmail(sendEmail, "foo@bar.com", null, fakeToken)).toEqual(true);
});
