const schoolExtractLimitEmailSenderRaw = require("../../../core/public/async_task/school_extract_limit_email_sender");

//local mock variables
let mockResult_GetSentSchoolRatio = [],
	mockResult_GetSchoolExtract = [],
	mockResult_GetSchoolExtractPageCount = [],
	mockGetTaskData = {};
let mockResult_GetExtractPercentageForSchool = [];
let mockResult_GetAssetPageCount = [];
//check for confirming the values
let emailData,
	isCheckCount = false,
	isInsertLog = false,
	isSendEmail = false,
	isCheckExistRatio = false;
let isCalled_GetExtractPercentageForSchool = false;
let isCalled_GetAssetPageCount = false;

//email sender parameters
let EMAIL_PARAMS = {
	from: null,
	to: "support@educationplatform.zendesk.com",
	subject: "",
	body: "",
};

/** Mock for send email */
jest.mock(`../../../common/sendEmail`, () => {
	return {
		send: () => {},
		sendTemplate: async (from, to, subject, data, attachment) => {
			emailData = {
				from: from,
				to: to,
				subject: subject,
				data: data,
				attachment: attachment,
			};
			isSendEmail = true;
		},
	};
});

const taskDetails = new (class taskDetails {
	query(query, values) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf("SELECT publisher.school_extract_limit_percentage AS value FROM") !== -1) {
			isCalled_GetExtractPercentageForSchool = true;
			return mockResult_GetExtractPercentageForSchool;
		}
		if (query.indexOf("SELECT copyable_page_count AS value FROM asset WHERE id") !== -1) {
			isCalled_GetAssetPageCount = true;
			return mockResult_GetAssetPageCount;
		}
		if (query.indexOf("SELECT COUNT(*) AS _count_") !== -1) {
			isCheckCount = true;
			return mockResult_GetSchoolExtractPageCount;
		}
		if (query.indexOf("SELECT asset_id, school_id, highest_percentage_ratio") !== -1) {
			isCheckExistRatio = true;
			return mockResult_GetSentSchoolRatio;
		}
		if (query.indexOf("INSERT INTO") !== -1) {
			isInsertLog = true;
			return [];
		}
		if (query.indexOf("SELECT extract.asset_id AS asset_id") !== -1) {
			return mockResult_GetSchoolExtract;
		}
	}
	getTaskData() {
		return mockGetTaskData;
	}
})();

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockGetTaskData = {
		school_id: 65,
		asset_id: 18329,
	};
	mockResult_GetExtractPercentageForSchool = {
		rows: [{ value: 20 }],
		rowCount: 1,
	};
	mockResult_GetAssetPageCount = {
		rows: [{ value: 100 }],
		rowCount: 1,
	};
	mockResult_GetSchoolExtractPageCount = {
		rows: [{ _count_: 12 }],
		rowCount: 1,
	};
	mockResult_GetSentSchoolRatio = {
		rows: [
			{
				asset_id: 18329,
				school_id: 65,
				highest_percentage_ratio: 10,
			},
		],
	};
	mockResult_GetSchoolExtract = {
		rows: [
			{
				asset_id: 18329,
				asset_name: "BTEC Tech Award in Sport, Activity and Fitness Student Book",
				isbn13: "9781446943625",
				extract_id: 307,
				extract_name: "TB 2",
				extract_page_count: 4,
				date_created: "2019-08-20T07:33:10.533Z",
				creator_school_id: 65,
				creator_school_name: "AVM Mandir (AVM-65)",
			},
			{
				asset_id: 18329,
				asset_name: "BTEC Tech Award in Sport, Activity and Fitness Student Book",
				isbn13: "9781446943625",
				extract_id: 303,
				extract_name: "Remark Pages",
				extract_page_count: 2,
				date_created: "2019-08-19T12:38:48.623Z",
				creator_school_id: 65,
				creator_school_name: "AVM Mandir (AVM-65)",
			},
		],
	};

	emailData = null;
	isCheckCount = false;
	isInsertLog = false;
	isSendEmail = false;
	isCheckExistRatio = false;
	isCalled_GetExtractPercentageForSchool = false;
	isCalled_GetAssetPageCount = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function schoolExtractLimitEmailSender() {
	let err = null;
	try {
		await schoolExtractLimitEmailSenderRaw(taskDetails);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	mockGetTaskData = {
		school_id: 65,
		asset_id: 18329,
	};
	mockResult_GetExtractPercentageForSchool = {
		rows: [{ value: 20 }],
		rowCount: 1,
	};
	mockResult_GetAssetPageCount = {
		rows: [{ value: 100 }],
		rowCount: 1,
	};
	mockResult_GetSchoolExtractPageCount = {
		rows: [{ _count_: 12 }],
		rowCount: 1,
	};
	//No any alert email is send
	mockResult_GetSentSchoolRatio = {
		rows: [],
	};
	mockResult_GetSchoolExtract = {
		rows: [
			{
				asset_id: 18329,
				asset_name: "BTEC Tech Award in Sport, Activity and Fitness Student Book",
				isbn13: "9781446943625",
				extract_id: 307,
				extract_name: "TB 2",
				extract_page_count: 4,
				date_created: "2019-08-20T07:33:10.533Z",
				creator_school_id: 65,
				creator_school_name: "AVM Mandir (AVM-65)",
				pages: [1, 2, 3, 4],
			},
			{
				asset_id: 18329,
				asset_name: "BTEC Tech Award in Sport, Activity and Fitness Student Book",
				isbn13: "9781446943625",
				extract_id: 303,
				extract_name: "Remark Pages",
				extract_page_count: 2,
				date_created: "2019-08-19T12:38:48.623Z",
				creator_school_id: 65,
				creator_school_name: "AVM Mandir (AVM-65)",
				pages: [1, 2, 3, 4],
			},
		],
	};

	expect(await schoolExtractLimitEmailSender()).toEqual(null);
	expect(isCalled_GetExtractPercentageForSchool).toEqual(true);
	expect(isCalled_GetAssetPageCount).toEqual(true);
	expect(isCheckCount).toEqual(true);
	expect(isInsertLog).toEqual(true);
	expect(isSendEmail).toEqual(true);
	expect(isCheckExistRatio).toEqual(true);
	expect(emailData.from).toEqual(EMAIL_PARAMS.from);
	expect(emailData.to).toEqual(EMAIL_PARAMS.to);
	expect(emailData.subject).not.toEqual(null);
	expect(emailData.body).not.toEqual(null);
});

test(`Not send an email when highest_percentage_ratio < 10`, async () => {
	mockGetTaskData = {
		school_id: 65,
		asset_id: 18329,
	};
	mockResult_GetExtractPercentageForSchool = {
		rows: [{ value: 20 }],
		rowCount: 1,
	};
	mockResult_GetAssetPageCount = {
		rows: [{ value: 100 }],
		rowCount: 1,
	};
	//Set school extract page count < 10
	mockResult_GetSchoolExtractPageCount = {
		rows: [{ _count_: 6 }],
		rowCount: 1,
	};
	//No any alert email is send
	mockResult_GetSentSchoolRatio = {
		rows: [],
	};
	mockResult_GetSchoolExtract = {
		rows: [],
	};
	expect(await schoolExtractLimitEmailSender()).toEqual(null);
	expect(isCalled_GetExtractPercentageForSchool).toEqual(true);
	expect(isCalled_GetAssetPageCount).toEqual(true);
	expect(isCheckCount).toEqual(true);
	expect(isInsertLog).toEqual(false);
	expect(isSendEmail).toEqual(false);
	expect(isCheckExistRatio).toEqual(false);
	expect(emailData).toEqual(null);
});

test(`Not send an email  when already send an alert at 10%`, async () => {
	mockResult_GetSchoolExtractPageCount = {
		rows: [{ _count_: 30 }],
	};
	mockGetTaskData = {
		school_id: 65,
		asset_id: 18329,
	};
	mockResult_GetExtractPercentageForSchool = {
		rows: [{ value: 20 }],
		rowCount: 1,
	};
	mockResult_GetAssetPageCount = {
		rows: [{ value: 100 }],
		rowCount: 1,
	};
	//Set school extract page count < 10
	mockResult_GetSchoolExtractPageCount = {
		rows: [{ _count_: 12 }],
		rowCount: 1,
	};
	//No any alert email is send
	mockResult_GetSentSchoolRatio = {
		rows: [
			{
				asset_id: 18329,
				school_id: 65,
				highest_percentage_ratio: 10,
			},
		],
	};
	mockResult_GetSchoolExtract = {
		rows: [],
	};
	expect(await schoolExtractLimitEmailSender()).toEqual(null);
	expect(emailData).toBeNull();
	expect(isCalled_GetExtractPercentageForSchool).toEqual(true);
	expect(isCalled_GetAssetPageCount).toEqual(true);
	expect(isCheckCount).toEqual(true);
	expect(isInsertLog).toEqual(false);
	expect(isSendEmail).toEqual(false);
	expect(isInsertLog).toEqual(false);
	expect(isSendEmail).toEqual(false);
	expect(isCheckExistRatio).toEqual(true);
});

test(`Not send an email when school extract percentage not found`, async () => {
	mockResult_GetSchoolExtractPageCount = {
		rows: [{ _count_: 30 }],
	};
	mockGetTaskData = {
		school_id: 65,
		asset_id: 18329,
	};
	mockResult_GetExtractPercentageForSchool = {
		rows: [],
		rowCount: 0,
	};
	mockResult_GetAssetPageCount = {
		rows: [{ value: 100 }],
		rowCount: 1,
	};
	//Set school extract page count < 10
	mockResult_GetSchoolExtractPageCount = {
		rows: [{ _count_: 12 }],
		rowCount: 1,
	};
	//No any alert email is send
	mockResult_GetSentSchoolRatio = {
		rows: [
			{
				asset_id: 18329,
				school_id: 65,
				highest_percentage_ratio: 10,
			},
		],
	};
	mockResult_GetSchoolExtract = {
		rows: [],
	};
	expect(await schoolExtractLimitEmailSender()).toEqual(null);
	expect(emailData).toBeNull();
	expect(isCalled_GetExtractPercentageForSchool).toEqual(true);
	expect(isCalled_GetAssetPageCount).toEqual(false);
	expect(isCheckCount).toEqual(false);
	expect(isInsertLog).toEqual(false);
	expect(isSendEmail).toEqual(false);
	expect(isInsertLog).toEqual(false);
	expect(isSendEmail).toEqual(false);
	expect(isCheckExistRatio).toEqual(false);
});

test(`Not send an email when school asset page count not found`, async () => {
	mockResult_GetSchoolExtractPageCount = {
		rows: [{ _count_: 30 }],
	};
	mockGetTaskData = {
		school_id: 65,
		asset_id: 18329,
	};
	mockResult_GetExtractPercentageForSchool = {
		rows: [{ value: 12 }],
		rowCount: 1,
	};
	mockResult_GetAssetPageCount = {
		rows: [],
		rowCount: 0,
	};
	//Set school extract page count < 10
	mockResult_GetSchoolExtractPageCount = {
		rows: [{ _count_: 12 }],
		rowCount: 1,
	};
	//No any alert email is send
	mockResult_GetSentSchoolRatio = {
		rows: [
			{
				asset_id: 18329,
				school_id: 65,
				highest_percentage_ratio: 10,
			},
		],
	};
	mockResult_GetSchoolExtract = {
		rows: [],
	};
	expect(await schoolExtractLimitEmailSender()).toEqual(null);
	expect(emailData).toBeNull();
	expect(isCalled_GetExtractPercentageForSchool).toEqual(true);
	expect(isCalled_GetAssetPageCount).toEqual(true);
	expect(isCheckCount).toEqual(false);
	expect(isInsertLog).toEqual(false);
	expect(isSendEmail).toEqual(false);
	expect(isInsertLog).toEqual(false);
	expect(isSendEmail).toEqual(false);
	expect(isCheckExistRatio).toEqual(false);
});
