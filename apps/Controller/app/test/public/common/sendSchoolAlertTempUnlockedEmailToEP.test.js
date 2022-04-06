const sendSchoolAlertTempUnlockedEmailToEPRaw = require("../../../core/public/common/sendSchoolAlertTempUnlockedEmailToEP");
const Context = require("../../common/Context");

let ctx;

let mockQuery;
let isCalledEmailFunction;
let mockEmailContent = [];
let mockSchoolInfo;
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
		return mockSchoolInfo;
	}
	if (query.indexOf(`INSERT INTO school_temp_unlock_attempt_email_alert_log`) >= 0) {
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
	mockSchoolInfo = {
		rowCount: 1,
		rows: [
			{
				count: 20,
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

async function sendSchoolAlertTempUnlockedEmailToEP(mockDbPool, schoolId, schoolName) {
	let err = null;
	try {
		result = await sendSchoolAlertTempUnlockedEmailToEPRaw(mockDbPool, schoolId, schoolName);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly when send alert email to EP`, async () => {
	expect(await sendSchoolAlertTempUnlockedEmailToEP(mockDbPool, 71, "hello123")).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
	expect(mockEmailContent[0].subject).toEqual("Temporary unlock alert");
	expect(mockEmailContent[0].from).toEqual(null);
	expect(mockEmailContent[0].to).toEqual("support@educationplatform.zendesk.com");
	expect(mockEmailContent[0].content.content).toEqual(
		"The institution, hello123, has temporarily unlocked 20 titles without unlocking them with the physical copy."
	);
	expect(mockEmailContent[0].content.cta).toEqual(null);
	expect(mockEmailContent[0].content.secondary_content).toEqual(null);
});

test(`Function render correctly when alert mail is not send to EP `, async () => {
	mockSchoolInfo = {
		rowCount: 1,
		rows: [
			{
				count: 14,
			},
		],
	};
	expect(await sendSchoolAlertTempUnlockedEmailToEP(mockDbPool, 71, "school")).toEqual(null);
	expect(isCalledEmailFunction).toEqual(false);
});
