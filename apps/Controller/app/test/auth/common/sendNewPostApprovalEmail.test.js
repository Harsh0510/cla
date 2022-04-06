const sendNewPostApprovalEmail = require("../../../core/auth/common/sendNewPostApprovalEmail");

let sendEmail, email, mockFrom, mockTo, mockSubject, mockBody;

function resetAll() {
	email = "foo@email.com";
	firstName = "Gagan Parmar";
	schoolName = "aum vidhya mandir";
	mockFrom = null;
	mockTo = "foo@email.com";
	mockSubject = "Get started on the Education Platform";
	mockBody = {
		content:
			"Hello ${firstName},<br/><br/>You can now use the Education Platform to help save time in lesson preparation and use ${schoolName}'s books to make copies under the CLA Education Licence.<br/><br/>You can find and unlock books, make copies, and share them right away.",
		cta: {
			title: "Get started",
			url: "http://localhost:16000/auth/disable-security-emails/90bf740d72e8e43e5e7e148d00fce595",
		},
		secondary_content:
			'If you need help with the platform, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.<br/><br/>Follow us on Twitter <a href="https://twitter.com/eduplatformuk" target="_blank">@EduPlatformUK</a>',
	};

	sendEmail = {
		sendTemplate: (from, to, subject, body) => {
			if (from === mockFrom && to === mockTo && subject === mockSubject) {
				return true;
			}
			return false;
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("function returns true", async () => {
	expect(sendNewPostApprovalEmail(sendEmail, email, firstName, schoolName)).toEqual(true);
});

test("function returns false when to email not passed", async () => {
	expect(sendNewPostApprovalEmail(sendEmail, "")).toEqual(false);
});
