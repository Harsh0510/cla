const extractAccessSendEmailCheckerRaw = require("../../../../core/public/async_task/extract_access_email_sender/extractAccessSendEmailChecker");

let mockLastCompletedId = {},
	mockNextId = {},
	mockData,
	extractAccessResult = null; //mock data
let isSendEmail = false,
	isInsertedLogTable = false,
	hasAccessCountHigh = false,
	isRecordDeleted = false,
	isPushedtoEmailChecker = false; //check with flag

let EMAIL_PARAMS = {
	from: "no-reply@educationplatform.co.uk",
	to: "support@educationplatform.zendesk.com",
	subject: "",
	body: "",
};

jest.mock(`../../../../core/public/async_task/extract_access_email_sender/pushExtractAccessSendEmailCheckerTask`, () => {
	return function (task) {
		isPushedtoEmailChecker = true;
	};
});

jest.mock("../../../../common/sendEmail", () => {
	return function () {
		return;
	};
});

jest.mock("../../../../core/public/async_task/extract_access_email_sender/extract_access_email_sender", () => {
	return function (data, taskDetails, sendEmail) {
		isSendEmail = true;
		return;
	};
});

const mockTaskDetail = new (class TaskDetail {
	async query(query) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT last_completed_id`) !== -1) {
			return mockLastCompletedId;
		} else if (query.indexOf(`SELECT id FROM extract_access`) !== -1) {
			return mockNextId;
		} else if (query.indexOf(`SELECT extract_access.id AS extract_access_id`) !== -1) {
			if (extractAccessResult.rows.length > 0) {
				hasAccessCountHigh = true;
			}
			return extractAccessResult;
		} else if (query.indexOf(`INSERT INTO`) !== -1) {
			isInsertedLogTable = true;
		}
	}
	async deleteSelf() {
		isRecordDeleted = true;
	}
})();

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockLastCompletedId = {
		rows: [
			{
				last_completed_id: 2,
			},
		],
		rowCount: 1,
	};
	mockNextId = {
		rows: [
			{
				id: 15,
			},
		],
		rowCount: 1,
	};
	isInsertedLogTable = false;
	isSendEmail = false;
	hasAccessCountHigh = false;
	extractAccessResult = {
		rows: [
			{
				extract_access_id: 15,
				extract_id: 245,
				extract_share_oid: "eda1c0f1ca33f9554f46aaefc84914776042",
				asset_id: 20,
				isbn13: "9780008144678",
				asset_name: "The Shanghai Maths Project Practice Book Year 6: For the English National Curriculum (Shanghai Maths)",
				extract_title: "test",
				creator_school_id: 4,
				creator_school_name: "Ernest Shackleton Memorial (CLA) High School",
				accessor_school_id: 4,
				accessor_school_name: "Ernest Shackleton Memorial (CLA) High School",
				ip_address: "::ffff:172.18.0.1",
				user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
				date_created: "2019-08-21T11:01:48.578Z",
			},
			{
				extract_access_id: 14,
				extract_id: 245,
				extract_share_oid: "eda1c0f1ca33f9554f46aaefc84914776042",
				asset_id: 20,
				isbn13: "9780008144678",
				asset_name: "The Shanghai Maths Project Practice Book Year 6: For the English National Curriculum (Shanghai Maths)",
				extract_title: "test",
				creator_school_id: 4,
				creator_school_name: "Ernest Shackleton Memorial (CLA) High School",
				accessor_school_id: 4,
				accessor_school_name: "Ernest Shackleton Memorial (CLA) High School",
				ip_address: "::ffff:172.18.0.1",
				user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
				date_created: "2019-08-21T11:01:48.578Z",
			},
		],
		rowCount: 2,
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractAccessSendEmailChecker() {
	let err = null;
	try {
		result = await extractAccessSendEmailCheckerRaw(mockTaskDetail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`call send email when extract access count > 25`, async () => {
	expect(await extractAccessSendEmailChecker()).toEqual(null);
	expect(result).toEqual(undefined);
	expect(hasAccessCountHigh).toEqual(true);
	expect(isSendEmail).toEqual(true);
	expect(isInsertedLogTable).toEqual(true);
	expect(isRecordDeleted).toEqual(true);
	expect(isPushedtoEmailChecker).toEqual(true);
});

test(`not send email when lastCompletedId is 0 and nextID is 0`, async () => {
	mockLastCompletedId = {
		rows: [],
		rowCount: 0,
	};
	mockNextId = {
		rows: [],
		rowCount: 0,
	};
	expect(await extractAccessSendEmailChecker()).toEqual(null);
	expect(result).toEqual(undefined);
	expect(hasAccessCountHigh).toEqual(false);
	expect(isSendEmail).toEqual(false);
	expect(isInsertedLogTable).toEqual(false);
	expect(isRecordDeleted).toEqual(true);
	expect(isPushedtoEmailChecker).toEqual(true);
});

test(`when acess extract is not available`, async () => {
	extractAccessResult = {
		rows: [],
		rowCount: 0,
	};
	expect(await extractAccessSendEmailChecker()).toEqual(null);
	expect(result).toEqual(undefined);
	expect(hasAccessCountHigh).toEqual(false);
	expect(isSendEmail).toEqual(false);
	expect(isInsertedLogTable).toEqual(true);
	expect(isRecordDeleted).toEqual(true);
	expect(isPushedtoEmailChecker).toEqual(true);
});
