const userNotCreatedCopiesEmailSenderRaw = require("../../../../core/auth/async_task/user_not_created_copies_email_sender/index");
let isCalledSendEmailByDaysFor_7_days = false;
let isCalledSendEmailByDaysFor_14_days = false;
let isCalledTaskDeleted = false;
jest.mock(`../../../../core/auth/async_task/user_not_created_copies_email_sender/pushTask`, () => {
	return function (task) {
		isPushedtoNotificationTask = true;
	};
});
jest.mock(`../../../../core/auth/async_task/user_not_created_copies_email_sender/sendEmailByDays`, () => {
	return function (taskDetails, days) {
		if (days === 7) {
			isCalledSendEmailByDaysFor_7_days = true;
		} else if (days === 14) {
			isCalledSendEmailByDaysFor_14_days = true;
		}
	};
});

const mockTaskDetail = new (class TaskDetail {
	async deleteSelf() {
		isCalledTaskDeleted = true;
	}
})();

/**
 * Reset function - called before each test.
 */
function resetAll() {
	isCalledSendEmailByDaysFor_7_days = false;
	isCalledSendEmailByDaysFor_14_days = false;
	isCalledTaskDeleted = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function userNotCreatedCopiesEmailSender() {
	let err = null;
	try {
		result = await userNotCreatedCopiesEmailSenderRaw(mockTaskDetail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await userNotCreatedCopiesEmailSender()).toEqual(null);
	expect(isCalledSendEmailByDaysFor_7_days).toEqual(true);
	expect(isCalledSendEmailByDaysFor_14_days).toEqual(true);
	expect(isCalledTaskDeleted).toEqual(true);
});
