const sendTempUnlockedEmailToUserRaw = require("../../../core/public/common/sendTempUnlockedEmailToUser");

let mockData;
let isCalledEmailFunction;
let mockEmailContent = [];

jest.mock(`../../../common/sendEmail`, () => {
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
	mockData = {
		userEmail: "test1@testchool.com",
		userFirstName: "userFirstName",
		title: "title",
		isbn: "9781847711199",
		expiration_date: "2021-03-30 13:31:41.401347+00",
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function sendTempUnlockedEmailToUser(email, firstName, assetTitle, isbn, expiryDate) {
	let err = null;
	try {
		result = await sendTempUnlockedEmailToUserRaw(email, firstName, assetTitle, isbn, expiryDate);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(
		await sendTempUnlockedEmailToUser(mockData.userEmail, mockData.userFirstName, mockData.title, mockData.isbn, mockData.expiration_date)
	).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent[0].subject).toEqual("You have temporarily unlocked 9781847711199");
	expect(mockEmailContent[0].from).toEqual(null);
	expect(mockEmailContent[0].to).toEqual("test1@testchool.com");
	expect(mockEmailContent[0].content.content).toEqual(
		"Dear userFirstName,<br/><br/>You have temporarily unlocked the title, title (9781847711199).<br/><br/>This title is now available for you to make copies until 30 March 2021. You will need to unlock this title using a physical copy of the book to continue to have access to the content and any copies you create from it."
	);
	expect(mockEmailContent[0].content.cta).toEqual(null);
	expect(mockEmailContent[0].content.secondary_content).toEqual(
		'If you need help with the Platform, please <a href="mailto:support@educationplatform.zendesk.com">contact us</a> for assistance.<br/><br/>Follow us on Twitter <a href="https://twitter.com/eduplatformuk" target="_blank">@EduPlatformUK</a><br/><br/> To manage the notifications and emails you receive from us, login to the <a href="http://localhost:16000/profile/my-details">My Details page</a>.'
	);
});
