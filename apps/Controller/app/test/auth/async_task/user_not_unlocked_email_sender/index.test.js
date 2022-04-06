const userNotUnlockedEmailSenderRaw = require("../../../../core/auth/async_task/user_not_unlocked_email_sender/index");
let isCalledSendEmailByDaysFor_5_days = false;
let isCalledSendEmailByDaysFor_12_days = false;
let isCalledTaskDeleted = false;
jest.mock(`../../../../core/auth/async_task/user_not_unlocked_email_sender/pushTask`, () => {
	return function (task) {
		isPushedtoNotificationTask = true;
	};
});
jest.mock(`../../../../core/auth/async_task/user_not_unlocked_email_sender/sendEmailByDays`, () => {
	return function (taskDetails, days) {
		if (days === 5) {
			isCalledSendEmailByDaysFor_5_days = true;
		} else if (days === 12) {
			isCalledSendEmailByDaysFor_12_days = true;
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
	isCalledSendEmailByDaysFor_5_days = false;
	isCalledSendEmailByDaysFor_12_days = false;
	isCalledTaskDeleted = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function userNotUnlockedEmailSender() {
	let err = null;
	try {
		result = await userNotUnlockedEmailSenderRaw(mockTaskDetail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await userNotUnlockedEmailSender()).toEqual(null);
	expect(isCalledSendEmailByDaysFor_5_days).toEqual(true);
	expect(isCalledSendEmailByDaysFor_12_days).toEqual(true);
	expect(isCalledTaskDeleted).toEqual(true);
});
