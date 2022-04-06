const unlockNotificationEmailSender = require("../../../../core/public/async_task/asset_available_email_log/unlockNotificationEmailSender");

let userAssetData, isSendEmail, hasAttachment, mockEmail;

const mockAssetData = [
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19681,
		authors_log: [{ role: "A", lastName: "Munson", firstName: "Victoria" }],
		publisher: "Hachette",
		publication_date: "2014-04-24T00:00:00.000Z",
		edition: 1,
		title: "British Mammals",
		pdf_isbn13: "9780750287180",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19876,
		authors_log: [{ role: "A", lastName: "Fox", firstName: "Annie" }],
		publisher: "Illuminate Publishing",
		publication_date: "2019-03-05T00:00:00.000Z",
		edition: 1,
		title: "The 39 Steps Play Guide for AQA GCSE Drama",
		pdf_isbn13: "9781911208723",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19682,
		authors_log: [{ role: "A", lastName: "Munson", firstName: "Victoria" }],
		publisher: "Hachette",
		publication_date: "2014-04-24T00:00:00.000Z",
		edition: 1,
		title: "British Mammals",
		pdf_isbn13: "9780750287181",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19877,
		authors_log: [{ role: "A", lastName: "Fox", firstName: "Annie" }],
		publisher: "Illuminate Publishing",
		publication_date: "2019-03-05T00:00:00.000Z",
		edition: 1,
		title: "The 39 Steps Play Guide for AQA GCSE Drama",
		pdf_isbn13: "9781911208724",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19683,
		authors_log: [{ role: "A", lastName: "Munson", firstName: "Victoria" }],
		publisher: "Hachette",
		publication_date: "2014-04-24T00:00:00.000Z",
		edition: 1,
		title: "British Mammals",
		pdf_isbn13: "9780750287182",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19878,
		authors_log: [{ role: "A", lastName: "Fox", firstName: "Annie" }],
		publisher: "Illuminate Publishing",
		publication_date: "2019-03-05T00:00:00.000Z",
		edition: 1,
		title: "The 39 Steps Play Guide for AQA GCSE Drama",
		pdf_isbn13: "9781911208725",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19684,
		authors_log: [{ role: "A", lastName: "Munson", firstName: "Victoria" }],
		publisher: "Hachette",
		publication_date: "2014-04-24T00:00:00.000Z",
		edition: 1,
		title: "British Mammals",
		pdf_isbn13: "9780750287183",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19879,
		authors_log: [{ role: "A", lastName: "Fox", firstName: "Annie" }],
		publisher: "Illuminate Publishing",
		publication_date: "2019-03-05T00:00:00.000Z",
		edition: 1,
		title: "The 39 Steps Play Guide for AQA GCSE Drama",
		pdf_isbn13: "9781911208726",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19685,
		authors_log: [{ role: "A", lastName: "Munson", firstName: "Victoria" }],
		publisher: "Hachette",
		publication_date: "2014-04-24T00:00:00.000Z",
		edition: 1,
		title: "British Mammals",
		pdf_isbn13: "9780750287184",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19880,
		authors_log: [{ role: "A", lastName: "Fox", firstName: "Annie" }],
		publisher: "Illuminate Publishing",
		publication_date: "2019-03-05T00:00:00.000Z",
		edition: 1,
		title: "The 39 Steps Play Guide for AQA GCSE Drama",
		pdf_isbn13: "9781911208727",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19686,
		authors_log: [{ role: "A", lastName: "Munson", firstName: "Victoria" }],
		publisher: "Hachette",
		publication_date: "2014-04-24T00:00:00.000Z",
		edition: 1,
		title: "British Mammals",
		pdf_isbn13: "9780750287185",
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19881,
		authors_log: [{ role: "A", lastName: "Fox", firstName: "Annie" }],
		publisher: "Illuminate Publishing",
		publication_date: "2019-03-05T00:00:00.000Z",
		edition: 1,
		title: "The 39 Steps Play Guide for AQA GCSE Drama",
		pdf_isbn13: "9781911208728",
	},
];

/** Mock for send email */
jest.mock(`../../../../common/sendEmail`, () => {
	return {
		send: () => {},
		sendTemplate: async (from, to, subject, data, attachment) => {
			mockEmail = to;
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

jest.mock(`../../../../common/generateExcelFile`, () => {
	return function (exportData, fileName, sheetName = "sheet1") {
		if (fileName) {
			hasAttachment = true;
			return {
				fileName: fileName,
				attachFiledata:
					"<Buffer 50 4b 03 04 0a 00 00 00 00 00 c2 88 17 53 d6 92 7c 11 5a 01 00 00 5a 01 00 00 11 00 00 00 64 6f 63 50 72 6f 70 73 2f 63 6f 72 65 2e 78 6d 6c 3c 3f>",
			};
		}
	};
});

function resetAll() {
	userAssetData = null;
	isSendEmail = false;
	hasAttachment = false;
	mockEmail = null;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Send an email when number of asset equal to 1 `, async () => {
	userAssetData = [mockAssetData[0]];
	const item = await unlockNotificationEmailSender(userAssetData);
	expect(isSendEmail).toEqual(true);
	expect(mockEmail).toEqual("bhadresh@cla.com");
});

test(`Send an email when number of asset equal to 2`, async () => {
	userAssetData = [mockAssetData[0], mockAssetData[1]];
	const item = await unlockNotificationEmailSender(userAssetData);
	expect(isSendEmail).toEqual(true);
	expect(mockEmail).toEqual("bhadresh@cla.com");
});

test(`Send an email when number of asset equal to 12`, async () => {
	userAssetData = [...mockAssetData];
	const item = await unlockNotificationEmailSender(userAssetData);
	expect(isSendEmail).toEqual(true);
	expect(hasAttachment).toEqual(true);
	expect(mockEmail).toEqual("bhadresh@cla.com");
});

test(`Not send an email when number of asset equal to 0`, async () => {
	userAssetData = [];
	const item = await unlockNotificationEmailSender(userAssetData);
	expect(isSendEmail).toEqual(false);
	expect(mockEmail).toEqual(null);
});

test(`Not send an email when user asset data is undefined`, async () => {
	userAssetData = undefined;
	const item = await unlockNotificationEmailSender(userAssetData);
	expect(isSendEmail).toEqual(false);
	expect(mockEmail).toEqual(null);
});
