const emailSenderRaw = require("../../../../core/auth/async_task/user_not_unlocked_email_sender/emailSender");
const sendEmailData = require(`../../../../common/sendEmailData`);
let mockData;
let isCalledEmailFunction;
let mockEmailContent = [];
let emailContent_info = sendEmailData.alertEmailUserNotUnlockedBook;
// require(`../../../../common/sendEmail`);
jest.mock(`../../../../common/sendEmail`, () => {
	return {
		sendTemplate: async function (from, to, subject, content) {
			const emailData = Object.create(null);
			emailData.from = from;
			emailData.to = to;
			emailData.subject = subject;
			emailData.content = content;
			mockEmailContent.push(emailData);
			isCalledEmailFunction = true;
		},
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockData = [
		{
			id: 1,
			email: "test1@testchool.com",
		},
		{
			id: 2,
			email: "test2@testchool.com",
		},
	];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function emailSender(data) {
	let err = null;
	try {
		result = await emailSenderRaw(data);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await emailSender(mockData)).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent[0].subject).toEqual(emailContent_info.subject);
	expect(mockEmailContent[0].from).toEqual(emailContent_info.from);
	expect(mockEmailContent[0].content.title).toEqual(emailContent_info.title);
	expect(mockEmailContent[0].content.content).toEqual(emailContent_info.body);
	expect(mockEmailContent[0].content.secondary_content).toEqual(emailContent_info.secondary_content);
});
