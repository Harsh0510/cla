const fs = require("fs");

const OLD_ENV = process.env;
let mockSmtpDetail;
let mockIsProduction = true;

/** Mock function for EmailClient */
jest.mock(`../../common/EmailClient`, () => {
	return class {
		send() {
			return true;
		}
		async sendTemplate() {
			return true;
		}
	};
});

/** Mock function for isProduction */
jest.mock(`../../common/smtpServerDetails`, () => {
	return mockSmtpDetail;
});

/** Mock function for isProduction */
jest.mock(`../../common/isProduction`, () => {
	return mockIsProduction;
});

const EMAIL_OUT_FILE = "/tmp/cla-test-suite-email-out-file.txt";

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockSmtpDetail = {
		username: null,
	};
	try {
		fs.unlinkSync(EMAIL_OUT_FILE);
	} catch (e) {}
}

/**
 * Clear everything before and after each test
 */
beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	resetAll();
});

afterEach(() => {
	process.env = OLD_ENV; // restore old env
	resetAll();
});

test(`Render EmailClient when productions`, async () => {
	process.env.EMAIL_WRITE_FILE = EMAIL_OUT_FILE;
	const sendEmail = require("../../common/sendEmail");
	const result = sendEmail;
	expect(await result.send()).toEqual(undefined);
	expect(await result.sendTemplate()).toEqual(undefined);
});

test(`Render EmailClient when userName is present`, async () => {
	process.env.EMAIL_WRITE_FILE = "";
	mockSmtpDetail.userName = "user_1";
	const sendEmail = require("../../common/sendEmail");
	const result = sendEmail;
	expect(await result.send()).toEqual(true);
	expect(await result.sendTemplate()).toEqual(true);
});

test(`Render EmailClient when userName is not present`, async () => {
	process.env.EMAIL_WRITE_FILE = "";
	mockSmtpDetail.userName = "";
	const sendEmail = require("../../common/sendEmail");
	const result = sendEmail;
	expect(await result.send()).toEqual(undefined);
	expect(await result.sendTemplate()).toEqual(undefined);
});
