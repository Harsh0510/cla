const sendEmailByDaysRaw = require("../../../../core/public/async_task/asset_temp_unlock_reminder_email_sender/sendEmailByDays");

let mockResultData, mockData;
let isGetUsersData = false;
let isInsertIntoLogTable = false;
let isCalledEmailSender = false;

jest.mock(`../../../../core/public/async_task/asset_temp_unlock_reminder_email_sender/emailSender`, () => {
	return async function (usersData) {
		isCalledEmailSender = true;
	};
});

const mockTaskDetail = new (class TaskDetail {
	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT asset_school_info.user_id,`) !== -1) {
			isGetUsersData = true;
			return mockResultData;
		} else if (query.indexOf(`INSERT INTO`) !== -1) {
			isInsertIntoLogTable = true;
			return;
		}
	}
})();

/**
 * Reset function - called before each test.
 */
function resetAll() {
	isGetUsersData = false;
	isCalledEmailSender = false;
	isInsertIntoLogTable = false;
	mockData = 7;
	mockResultData = {
		rowCount: 2,
		rows: [
			{
				id: 1,
				user_id: 1,
				asset_id: 1,
				school_id: 1,
				pdf_isbn13: "9781847711199",
				title: "test title 1",
				first_name: "name1",
				email: "test1@testchool.com",
			},
			{
				id: 2,
				user_id: 2,
				asset_id: 2,
				school_id: 2,
				pdf_isbn13: "9781847711199",
				title: "test title 2",
				first_name: "name2",
				email: "test2@testchool.com",
			},
		],
	};
}
/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function sendEmailByDays(mockData) {
	let err = null;
	try {
		result = await sendEmailByDaysRaw(mockTaskDetail, mockData);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly for 7 days`, async () => {
	expect(await sendEmailByDays(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isCalledEmailSender).toEqual(true);
});

test(`Not send an email when no data found`, async () => {
	mockData = 7;
	mockResultData = {
		rowCount: 0,
		rows: [],
	};
	expect(await sendEmailByDays(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(false);
	expect(isCalledEmailSender).toEqual(false);
});

test(`Function render correctly without the days params`, async () => {
	expect(await sendEmailByDays()).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isCalledEmailSender).toEqual(true);
});

test(`Not send an email when user id not found`, async () => {
	mockData = 7;
	mockResultData = {
		rowCount: 1,
		rows: [
			{
				user_id: 1,
				asset_id: 1,
				school_id: 1,
				pdf_isbn13: "9781847711199",
				title: "test title 1",
				first_name: "name1",
				email: "test1@testchool.com",
			},
		],
	};
	expect(await sendEmailByDays(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(false);
	expect(isCalledEmailSender).toEqual(false);
});

test(`Not send an email when school id not found`, async () => {
	mockData = 7;
	mockResultData = {
		rowCount: 1,
		rows: [
			{
				id: 1,
				user_id: 1,
				asset_id: 1,
				pdf_isbn13: "9781847711199",
				title: "test title 1",
				first_name: "name1",
				email: "test1@testchool.com",
			},
		],
	};
	expect(await sendEmailByDays(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(false);
	expect(isCalledEmailSender).toEqual(false);
});

test(`Not send an email when asset id not found`, async () => {
	mockData = 7;
	mockResultData = {
		rowCount: 1,
		rows: [
			{
				id: 1,
				user_id: 1,
				school_id: 1,
				pdf_isbn13: "9781847711199",
				title: "test title 1",
				first_name: "name1",
				email: "test1@testchool.com",
			},
		],
	};
	expect(await sendEmailByDays(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(false);
	expect(isCalledEmailSender).toEqual(false);
});
