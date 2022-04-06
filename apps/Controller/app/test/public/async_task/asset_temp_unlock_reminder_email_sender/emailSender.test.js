const emailSenderRaw = require("../../../../core/public/async_task/asset_temp_unlock_reminder_email_sender/emailSender");

let mockData;
let isCalledEmailFunction;
let mockEmailContent = [];

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
			user_id: 1,
			asset_id: 1,
			school_id: 1,
			pdf_isbn13: "9781847711199",
			title: "test title 1",
			first_name: "name1",
			email: "test1@testchool.com",
			date_diff_days: 5,
		},
	];
	mockEmailContent = [];
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
	expect(await emailSender(mockData, 7)).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent[0].subject).toEqual("Temporarily unlocked book 9781847711199");
	expect(mockEmailContent[0].from).toEqual(null);
	expect(mockEmailContent[0].to).toEqual("test1@testchool.com");
	expect(mockEmailContent[0].content.content).toEqual(
		"Dear name1,<br /><br />The temporary unlock of test title 1 (9781847711199) is expiring in 5 days.<br /><br />Please unlock this title using a physical copy to continue to have access to the content."
	);
});
