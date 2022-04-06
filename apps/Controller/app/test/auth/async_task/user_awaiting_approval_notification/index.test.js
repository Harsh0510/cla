const userAwaitingApprovalNotificationRaw = require("../../../../core/auth/async_task/user_awaiting_approval_notification/index.js");
let isTaskDeleted,
	isPushedtoNotificationTask = false;
jest.mock(`../../../../core/auth/async_task/user_awaiting_approval_notification/notificationChecker`, () => {
	return function (task) {
		isPushedtoNotificationTask = true;
	};
});

let isGetNotification,
	isGetPendingUsers,
	isGetUserList,
	isInsertIntoNotification,
	isInsertIntoLogTable = false;
let mockResultNotificationCategories, mockResultPendingUsers, mockResultUsersList;
/**
 * Reset function - called before each test.
 */
function resetAll() {
	isTaskDeleted = false;
	isPushedtoNotificationTask = false;
	isGetNotification = false;
	isGetPendingUsers = false;
	isGetUserList = false;
	isInsertIntoNotification = false;
	isInsertIntoLogTable = false;
	mockResultNotificationCategories = {
		rows: [{ id: 1, name: "awaiting-approval" }],
	};
	mockResultPendingUsers = {
		rows: [
			{ id: 1, email: "test1@email.com", school_id: 1 },
			{ id: 2, email: "test1@email.com", school_id: 2 },
		],
	};
	mockResultUsersList = {
		rows: [
			{ school_id: 1, ids: [5, 7] },
			{ school_id: 2, ids: [8, 9] },
		],
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

const mockTaskDetail = new (class TaskDetail {
	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT id, hideable FROM notification_category WHERE`) !== -1) {
			isGetNotification = true;
			return mockResultNotificationCategories;
		} else if (query.indexOf(`SELECT id, email, school_id FROM cla_user`) !== -1) {
			isGetPendingUsers = true;
			return mockResultPendingUsers;
		} else if (query.indexOf(`SELECT school_id, ARRAY_AGG(id) AS ids FROM cla_user`) !== -1) {
			isGetUserList = true;
			return mockResultUsersList;
		} else if (query.indexOf(`INSERT INTO notification`) !== -1) {
			isInsertIntoNotification = true;
			return;
		} else if (query.indexOf(`INSERT INTO user_awaiting_approval_notification_log`) !== -1) {
			isInsertIntoLogTable = true;
			return;
		}
	}
	async deleteSelf() {
		isTaskDeleted = true;
	}
})();

async function userAwaitingApprovalNotification() {
	let err = null;
	try {
		result = await userAwaitingApprovalNotificationRaw(mockTaskDetail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await userAwaitingApprovalNotification()).toEqual(null);
	expect(isGetNotification).toEqual(true);
	expect(isGetPendingUsers).toEqual(true);
	expect(isGetUserList).toEqual(true);
	expect(isInsertIntoNotification).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
});

test(`Function render correctly when not categary found`, async () => {
	mockResultNotificationCategories = { raws: [] };
	expect(await userAwaitingApprovalNotification()).toEqual(null);
	expect(isGetNotification).toEqual(true);
	expect(isGetPendingUsers).toEqual(false);
	expect(isGetUserList).toEqual(false);
	expect(isInsertIntoNotification).toEqual(false);
	expect(isInsertIntoLogTable).toEqual(false);
	expect(isTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
});

test(`No any notification are available`, async () => {
	mockResultPendingUsers = { raws: [] };
	expect(await userAwaitingApprovalNotification()).toEqual(null);
	expect(isGetNotification).toEqual(true);
	expect(isGetPendingUsers).toEqual(true);
	expect(isGetUserList).toEqual(false);
	expect(isInsertIntoNotification).toEqual(false);
	expect(isInsertIntoLogTable).toEqual(false);
	expect(isTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
});

test(`When multiple pending users for same school`, async () => {
	mockResultPendingUsers = {
		rows: [
			{ id: 1, email: "test1@email.com", school_id: 1 },
			{ id: 2, email: "test1@email.com", school_id: 2 },
			{ id: 3, email: "test1@email.com", school_id: 1 },
			{ id: 4, email: "test1@email.com", school_id: 1 },
		],
	};
	mockResultUsersList = {
		rows: [
			{ school_id: 1, ids: [5, 7] },
			{ school_id: 2, ids: [8, 9] },
		],
	};
	expect(await userAwaitingApprovalNotification()).toEqual(null);
	expect(isGetNotification).toEqual(true);
	expect(isGetPendingUsers).toEqual(true);
	expect(isGetUserList).toEqual(true);
	expect(isInsertIntoNotification).toEqual(true);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
});

test(`When multiple pending users for same school and no any school-admin found for add the notification`, async () => {
	mockResultPendingUsers = {
		rows: [
			{ id: 1, email: "test1@email.com", school_id: 1 },
			{ id: 2, email: "test1@email.com", school_id: 2 },
			{ id: 3, email: "test1@email.com", school_id: 1 },
			{ id: 4, email: "test1@email.com", school_id: 1 },
		],
	};
	mockResultUsersList = {
		rows: [],
	};
	expect(await userAwaitingApprovalNotification()).toEqual(null);
	expect(isGetNotification).toEqual(true);
	expect(isGetPendingUsers).toEqual(true);
	expect(isGetUserList).toEqual(true);
	expect(isInsertIntoNotification).toEqual(false);
	expect(isInsertIntoLogTable).toEqual(true);
	expect(isTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
});
