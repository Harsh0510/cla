const sendTempUnlockedEmailToEPRaw = require("../../../core/public/common/sendTempUnlockedEmailToEP");
const { rawToNiceDate } = require("../../../common/date");
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
		schoolName: "test school",
		assetTitle: "title",
		isbn: "9781847711199",
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function sendTempUnlockedEmailToEP(schoolName, assetTitle, isbn) {
	let err = null;
	try {
		result = await sendTempUnlockedEmailToEPRaw(schoolName, assetTitle, isbn);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	const currentDate = Date.now();
	const createdDate = rawToNiceDate(currentDate);
	expect(await sendTempUnlockedEmailToEP(mockData.schoolName, mockData.assetTitle, mockData.isbn)).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent[0].subject).toEqual("9781847711199 has been temporarily unlocked by test school");
	expect(mockEmailContent[0].from).toEqual(null);
	expect(mockEmailContent[0].to).toEqual("support@educationplatform.zendesk.com");
	expect(mockEmailContent[0].content.content).toEqual(
		`The title, title (9781847711199), has been temporarily unlocked by test school on ${createdDate}.`
	);
	expect(mockEmailContent[0].content.cta).toEqual(null);
	expect(mockEmailContent[0].content.secondary_content).toEqual(null);
});
