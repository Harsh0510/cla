const emailSenderRaw = require(`../../../../core/auth/async_task/user_not_verified_email_sender/emailSender`);
const sendEmailData = require(`../../../../common/sendEmailData`);
const emailContent_3_days = sendEmailData.alertEmailUserNotVerified;
const emailContent_10_days = sendEmailData.alertEmailUserNotVerified_10_Days;
const emailContent_17_days = sendEmailData.alertEmailUserNotVerified_17_Days;

let mockData;
let isCalledEmailFunction;
let mockEmailContent = [];
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

let mockApproved;

jest.mock(`../../../../core/auth/common/getRegisteredDomainStatus`, () => {
	return () => {
		return mockApproved;
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockApproved = false;
	mockData = {
		usersData: [
			{
				oid: "6affca7713d5ee63777147842e15f2add3c4",
				email: "test1@testchool.com",
			},
			{
				oid: "c74bae954f6f53f626c0291661b1bf92ffae",
				email: "test2@testchool.com",
			},
		],
		hours: 71,
	};
	mockEmailContent = [];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function emailSender(usersData, hours) {
	let err = null;
	try {
		result = await emailSenderRaw(usersData, hours);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	mockData.hours = 71;
	expect(await emailSender(mockData.usersData, mockData.hours)).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
});

test(`Send email for 71 hours`, async () => {
	mockData.hours = 71;
	expect(await emailSender(mockData.usersData, mockData.hours)).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent.length).toEqual(2);
	expect(mockEmailContent[0].subject).toEqual(emailContent_3_days.subject);
	expect(mockEmailContent[0].from).toEqual(emailContent_3_days.from);
	expect(mockEmailContent[0].content.title).toEqual(emailContent_3_days.title);
	expect(mockEmailContent[0].content.content).toEqual(emailContent_3_days.body);
	expect(mockEmailContent[0].content.secondary_content).toEqual(emailContent_3_days.secondary_content);
});

test(`Send email for 71 hours (approved)`, async () => {
	mockData.hours = 71;
	mockApproved = true;
	expect(await emailSender(mockData.usersData, mockData.hours)).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent.length).toEqual(2);
	expect(mockEmailContent[0].subject).toEqual(emailContent_3_days.subject);
	expect(mockEmailContent[0].from).toEqual(emailContent_3_days.from);
	expect(mockEmailContent[0].content.title).toEqual(emailContent_3_days.title);
	expect(mockEmailContent[0].content.content).toEqual(emailContent_3_days.body);
	expect(mockEmailContent[0].content.secondary_content).toEqual(emailContent_3_days.secondary_content);
});

test(`Send email for 239 hours`, async () => {
	mockData.hours = 239;
	expect(await emailSender(mockData.usersData, mockData.hours)).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent.length).toEqual(2);
	expect(mockEmailContent[0].subject).toEqual(emailContent_10_days.subject);
	expect(mockEmailContent[0].from).toEqual(emailContent_10_days.from);
	expect(mockEmailContent[0].content.title).toEqual(emailContent_10_days.title);
	expect(mockEmailContent[0].content.content).toEqual(emailContent_10_days.body);
	expect(mockEmailContent[0].content.secondary_content).toEqual(emailContent_10_days.secondary_content);
});

test(`Send email for 407 hours`, async () => {
	mockData.hours = 407;
	expect(await emailSender(mockData.usersData, mockData.hours)).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent.length).toEqual(2);
	expect(mockEmailContent[0].subject).toEqual(emailContent_17_days.subject);
	expect(mockEmailContent[0].from).toEqual(emailContent_17_days.from);
	expect(mockEmailContent[0].content.title).toEqual(emailContent_17_days.title);
	expect(mockEmailContent[0].content.content).toEqual(emailContent_17_days.body);
	expect(mockEmailContent[0].content.secondary_content).toEqual(emailContent_17_days.secondary_content);
});
