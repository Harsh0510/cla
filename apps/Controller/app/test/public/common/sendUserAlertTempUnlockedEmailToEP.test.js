const sendUserAlertTempUnlockedEmailToEPRaw = require("../../../core/public/common/sendUserAlertTempUnlockedEmailToEP");
const Context = require("../../common/Context");

let ctx;

let mockQuery;
let isCalledEmailFunction;
let mockEmailContent = [];
let mockUserInfo;
let mockDbPool;

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

mockQuery = async (query) => {
	query = query.trim().replace(/\s+/g, " ");
	if (query.indexOf(`SELECT COUNT(*) AS count FROM asset_school_info`) >= 0) {
		return mockUserInfo;
	}
	if (query.indexOf(`INSERT INTO user_temp_unlock_attempt_email_alert_log`) >= 0) {
		return {};
	}
	if (query.indexOf(`INSERT INTO temp_unlock_alert_log`) >= 0) {
		return {};
	}
};
/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockUserInfo = {
		rowCount: 1,
		rows: [
			{
				count: 3,
			},
		],
	};
	ctx = new Context();
	mockDbPool = ctx.getAppDbPool();
	mockDbPool.query = mockQuery;
	isCalledEmailFunction = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function sendUserAlertTempUnlockedEmailToEP(mockDbPool, userId, schoolId, schoolName) {
	let err = null;
	try {
		result = await sendUserAlertTempUnlockedEmailToEPRaw(mockDbPool, userId, schoolId, schoolName);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly send alert email to EP`, async () => {
	expect(await sendUserAlertTempUnlockedEmailToEP(mockDbPool, 123, 12, "test school")).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent[0].subject).toEqual("Temporary unlock alert");
	expect(mockEmailContent[0].from).toEqual(null);
	expect(mockEmailContent[0].to).toEqual("support@educationplatform.zendesk.com");
	expect(mockEmailContent[0].content.content).toEqual(
		"The user, 123, from test school has temporarily unlocked 3 titles without unlocking them with the physical copy."
	);
	expect(mockEmailContent[0].content.cta).toEqual(null);
	expect(mockEmailContent[0].content.secondary_content).toEqual(null);
});

test(`Function render correctly when alert mail is not send to EP `, async () => {
	mockUserInfo = {
		rowCount: 0,
		rows: [{}],
	};
	expect(await sendUserAlertTempUnlockedEmailToEP(mockDbPool, 123, 12, "school")).toEqual(null);
	expect(isCalledEmailFunction).toEqual(false);
});
