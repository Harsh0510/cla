const EmailClient = require(`../../common/EmailClient`);
const OLD_ENV = process.env;

let mockError, mockMessage;
let user, password, host;
let mockFromData;

// jest.mock(`nodemailer`, () => {
// 	return {
// 		createTransport : {
// 			connect : (emailConfig) => {
// 				return {
// 					send : async (emailData, callBack) => {
// 						return callBack(mockError, mockMessage);
// 					}
// 				}
// 			},
// 			sendEmail: ()=> { return true}
// 		}
// 	}
// });

const sendMailMock = jest.fn(); // this will return undefined if .sendMail() is called
// In order to return a specific value you can use this instead
// const sendMailMock = jest.fn().mockReturnValue(/* Whatever you would expect as return value */);
jest.mock("nodemailer");

const nodemailer = require("nodemailer");
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

beforeEach(() => {
	sendMailMock.mockClear();
	nodemailer.createTransport.mockClear();
});

/**Mock function for isProduction*/
jest.mock(`../../common/smtpServerDetails`, () => {
	return {
		userName: "test@email.com",
		password: "test123",
		host: "smtp.test.com",
	};
});

function resetAll() {
	mockError = null;
	mockMessage = "Success";
	user = "email@email.com";
	password = "email@email";
	host = "host@host";
	ssl = true;

	mockFromData = {
		from: "email@outlook.com",
		to: "clientmail@outlook.com",
		subject: "Test Subject 1",
		data: "Test email data.",
		htmlBody: "<h1>Hi<h1><br/><p>Send test Email</p>",
		attachment: [
			new File(["foo"], "foo.txt", {
				type: "text/plain",
			}),
		],
		headers: { foo: "foo" },
	};
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
}

beforeEach(resetAll);
afterEach(resetAll);

describe(`sendTemplate`, () => {
	test(`Success when pass all the params`, () => {
		let funResult = null,
			error = null;
		const objEmailClient = new EmailClient(user, password, host);
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when data as object`, () => {
		const objEmailClient = new EmailClient(user, password, host);
		mockFromData.data = { content: "Email content" };
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when pass email information from process params`, () => {
		mockError = null;
		let funResult = null,
			error = null;
		const objEmailClient = new EmailClient();
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when pass process.env.CLA_BLOB_STORAGE_URL`, () => {
		let funResult = null,
			error = null;
		process.env.CLA_BLOB_STORAGE_URL = "DummyPath";
		const objEmailClient = new EmailClient();
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when pass process.env.CLA_FALLBACK_BLOB_STORAGE_ACCOUNT`, () => {
		let funResult = null,
			error = null;
		delete process.env.CLA_BLOB_STORAGE_URL;
		process.env.CLA_FALLBACK_BLOB_STORAGE_ACCOUNT = "DummyPath";
		const objEmailClient = new EmailClient();
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when pass data as object with values`, () => {
		let funResult = null,
			error = null;
		mockMessage = "Success";
		mockFromData.data = {
			content: "Email data information",
		};
		mockFromData.attachment = [
			new File(["foo"], "foo.txt", {
				type: "text/plain",
			}),
		];
		const objEmailClient = new EmailClient(user, password, host);
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data, mockFromData.attachment);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when pass data as null`, () => {
		let funResult = null,
			error = null;
		mockFromData.data = {
			category: null,
		};
		mockFromData.attachment = new File(["foo"], "foo.txt", {
			type: "text/plain",
		});
		const objEmailClient = new EmailClient(user, password, host);
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data, mockFromData.attachment);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when pass data as object with title`, () => {
		let funResult = null,
			error = null;
		mockFromData.data = {
			title: "Test Title",
		};
		const objEmailClient = new EmailClient(user, password, host);
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when pass data as object with icon`, () => {
		let funResult = null,
			error = null;
		mockFromData.data = {
			title: "Test Title",
			icon: "Education Platoform Icon",
		};
		const objEmailClient = new EmailClient(user, password, host);
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when process.env.SEND_ALL_EMAILS_TO and process.env.SEND_ALL_EMAILS_FROM has values`, () => {
		let funResult = null,
			error = null;
		process.env.SEND_ALL_EMAILS_TO = "test@email.com";
		process.env.SEND_ALL_EMAILS_FROM = "testfrom@email.com";
		const EmailClient = require(`../../common/EmailClient`);
		const nodemailer = require("nodemailer");
		nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
		mockFromData.data = {
			title: "Test Title",
			icon: "Education Platoform Icon",
		};
		const objEmailClient = new EmailClient(user, password, host);
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when pass category`, () => {
		mockError = null;
		let funResult = null,
			error = null;
		mockFromData.data = {
			title: "Test Title",
			icon: "Education Platoform Icon",
			category: "test",
		};
		const objEmailClient = new EmailClient();
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when pass category as array`, () => {
		mockError = null;
		let funResult = null,
			error = null;
		mockFromData.data = {
			title: "Test Title",
			icon: "Education Platoform Icon",
			category: ["test"],
		};
		const objEmailClient = new EmailClient();
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});

	test(`Success when email is sent to multiple users`, () => {
		let funResult = null,
			error = null;
		process.env.SEND_ALL_EMAILS_TO = "test1@email.com;test2@email.com";
		const EmailClient = require(`../../common/EmailClient`);
		const nodemailer = require("nodemailer");
		nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
		mockFromData.data = {
			title: "Test Title",
			icon: "Education Platoform Icon",
		};
		const objEmailClient = new EmailClient(user, password, host);
		objEmailClient.sendTemplate(mockFromData.from, mockFromData.to, mockFromData.subject, mockFromData.data);
		expect(sendMailMock).toHaveBeenCalled();
	});
});
