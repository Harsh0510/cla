const sendEmailByHoursRaw = require("../../../../core/auth/async_task/user_not_verified_email_sender/sendEmailByHours");
let mockResultData, mockData;
let isGetUsersData = false;
let isUpdateUserActivationToken = false;
let isInsertIntoLogTable = false;
let isCalledEmailSender = false;
let mockIsIncludeDateEdited;

jest.mock(`../../../../core/auth/async_task/user_not_verified_email_sender/emailSender`, () => {
	return async function (usersData) {
		isCalledEmailSender = true;
	};
});

const mockTaskDetail = new (class TaskDetail {
	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT cla_user.id,`) !== -1) {
			isGetUsersData = true;
			return mockResultData;
		} else if (query.indexOf(`UPDATE cla_user`) !== -1) {
			isUpdateUserActivationToken = true;
			return;
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
	isUpdateUserActivationToken = false;
	isInsertIntoLogTable = false;
	mockData = 71;
	mockResultData = {
		rowCount: 2,
		rows: [
			{
				id: 1,
				email: "test1@testchool.com",
			},
			{
				id: 2,
				email: "test2@testchool.com",
			},
		],
	};
	mockIsIncludeDateEdited = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function sendEmailByHours(mockData) {
	let err = null;
	try {
		result = await sendEmailByHoursRaw(mockTaskDetail, mockData);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly for 71 hours`, async () => {
	mockData = 71;
	expect(await sendEmailByHours(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isUpdateUserActivationToken).toEqual(true);
	expect(isCalledEmailSender).toEqual(true);
});

test(`Function render correctly for 239 hours`, async () => {
	mockData = 239;
	expect(await sendEmailByHours(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isCalledEmailSender).toEqual(true);
});

test(`Function render correctly for 407 hours`, async () => {
	mockData = 407;
	expect(await sendEmailByHours(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isUpdateUserActivationToken).toEqual(true);
	expect(isCalledEmailSender).toEqual(true);
});

test(`Not send an email when no data found`, async () => {
	mockData = 7;
	mockResultData = {
		rowCount: 0,
		rows: [],
	};
	expect(await sendEmailByHours(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(false);
	expect(isUpdateUserActivationToken).toEqual(false);
	expect(isCalledEmailSender).toEqual(false);
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	mockData = 71;
	mockTaskDetail.query = (query, data) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT cla_user.id,`) !== -1) {
			isGetUsersData = true;
			return mockResultData;
		} else if (query.indexOf(`UPDATE cla_user`) !== -1) {
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			isUpdateUserActivationToken = true;
			return;
		} else if (query.indexOf(`INSERT INTO`) !== -1) {
			isInsertIntoLogTable = true;
			return;
		}
	};
	expect(await sendEmailByHours(mockData)).toEqual(null);
	expect(isGetUsersData).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isUpdateUserActivationToken).toEqual(true);
	expect(isCalledEmailSender).toEqual(true);
	expect(mockIsIncludeDateEdited).toBe(true);
});
