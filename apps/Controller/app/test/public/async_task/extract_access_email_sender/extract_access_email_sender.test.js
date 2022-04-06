const extractAccessEmailSenderRaw = require("../../../../core/public/async_task/extract_access_email_sender/extract_access_email_sender");

let mockExtractAccessRows,
	isSendEmail = false,
	emailData = Object.create(null);
let result = null;
//email sender parameters
let EMAIL_PARAMS = {
	from: null,
	to: "support@educationplatform.zendesk.com",
	subject: "",
	body: "",
};

jest.mock(`../../../../common/generateExcelFile`, () => {
	return function (export_ExtractAccessData, fileName, sheetName) {
		return {
			fileName: "2019-08-21_11-08-49.usage-report.xlsx",
			attachFiledata: `<Buffer 50 4b 03 04 0a 00 00 00 00 00 19 59 15 4f d6 92 7c 11 5a 01 00 00 5a 01 00 00 11 00 00 00 64 6f 63 50 72 6f 70 73 2f 63 6f 72 65 2e 78 6d 6c 3c 3f 78 ... >`,
		};
	};
});

/** Mock for send email */
jest.mock(`../../../../common/sendEmail`, () => {
	return {
		send: () => {
			return;
		},
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

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockExtractAccessRows = [
		{
			extract_id: 245,
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
			extract_id: 245,
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
			date_created: "2019-08-21T11:01:51.243Z",
		},
	];
	isSendEmail = false;
	isSelectExecute = false;
	emailData = Object.create(null);
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractAccessEmailSender(data) {
	let err = null;
	try {
		result = await extractAccessEmailSenderRaw(data);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await extractAccessEmailSender(mockExtractAccessRows)).toEqual(null);
	expect(result).toEqual(undefined);
	expect(emailData.from).toEqual(EMAIL_PARAMS.from);
	expect(emailData.to).toEqual(EMAIL_PARAMS.to);
	expect(emailData.subject).not.toEqual(null);
	expect(emailData.body).not.toEqual(null);
	expect(isSendEmail).toEqual(true);
});

test(`When no records are found`, async () => {
	expect(await extractAccessEmailSender(mockExtractAccessRows)).toEqual(null);
	expect(result).toEqual(undefined);
	expect(emailData.from).toEqual(EMAIL_PARAMS.from);
	expect(emailData.to).toEqual(EMAIL_PARAMS.to);
	expect(emailData.subject).not.toEqual(null);
	expect(emailData.body).not.toEqual(null);
	expect(isSendEmail).toEqual(true);
});
