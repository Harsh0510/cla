const sendEmailByDaysRaw = require("../../../../core/auth/async_task/user_not_unlocked_email_sender/sendEmailByDays");
let mockResultData, mockData;
let isGetUsersData = false;
let isInsertIntoLogTable = false;
let isCalledEmailSender = false;
jest.mock(`../../../../core/auth/async_task/user_not_unlocked_email_sender/emailSender`, () => {
	return async function (userData) {
		if (userData.length) {
			isCalledEmailSender = true;
		}
	};
});

const mockTaskDetail = new (class TaskDetail {
	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT cla_user.id,`) !== -1) {
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
				email: "test1@testchool.com",
				should_receive_email: true,
			},
			{
				id: 2,
				email: "test2@testchool.com",
				should_receive_email: false,
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

test(`Function render correctly for 5 days`, async () => {
	expect(await sendEmailByDays(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isCalledEmailSender).toEqual(true);
});

test(`Function render correctly for 12 days`, async () => {
	mockData = 14;
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

test(`Not send an email but store the log into log table when user disabled "Receive email reminders to create my first copy"`, async () => {
	mockData = 7;
	mockResultData = {
		rowCount: 1,
		rows: [
			{
				id: 2,
				email: "test2@testchool.com",
				should_receive_email: false,
			},
		],
	};
	expect(await sendEmailByDays(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isCalledEmailSender).toEqual(false);
});

test(`Function render correctly without the days params`, async () => {
	expect(await sendEmailByDays()).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isCalledEmailSender).toEqual(true);
});
