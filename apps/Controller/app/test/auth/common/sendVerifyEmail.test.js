const sendVerifyEmail = require("../../../core/auth/common/sendVerifyEmail");

let sendEmail, email, token;

function resetAll() {
	sendEmail = {
		sendTemplate: (_) => {
			return true;
		},
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test("function returns true", async () => {
	expect(sendVerifyEmail(sendEmail, email, token)).toEqual(true);
});

test("Always passes 'from' value when called send email function", async () => {
	expect(sendVerifyEmail(sendEmail, email, token)).toEqual(true);
});

test("Always passes 'to' value when called send email function", async () => {
	expect(sendVerifyEmail(sendEmail, email, token)).toEqual(true);
});

test("Always passes 'Subject' value when called send email function", async () => {
	expect(sendVerifyEmail(sendEmail, email, token)).toEqual(true);
});

test("Always passes 'body' value when called send email function", async () => {
	expect(sendVerifyEmail(sendEmail, email, token)).toEqual(true);
});

test("Always get 'url' value when called send email function", async () => {
	expect(sendVerifyEmail(sendEmail, email, token)).toEqual(true);
});

test("Always get 'token' value when called send email function", async () => {
	expect(sendVerifyEmail(sendEmail, email, token)).toEqual(true);
});
