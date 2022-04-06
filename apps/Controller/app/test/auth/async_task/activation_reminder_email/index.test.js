const userNotVerifiedEmailSenderRaw = require("../../../../core/auth/async_task/activation_reminder_email/index");

let isCalledTaskDeleted = false;
let isSendEmailCalles = false;

jest.mock(`../../../../core/auth/async_task/activation_reminder_email/pushTask`, () => {
	return function (task) {
		isPushedtoNotificationTask = true;
	};
});
jest.mock(`../../../../core/auth/async_task/activation_reminder_email/process`, () => {
	return function (taskDetails, hours) {
		isSendEmailCalles = true;
	};
});

const mockTaskDetail = new (class TaskDetail {
	async deleteSelf() {
		isCalledTaskDeleted = true;
	}
	async query() {}
})();

/**
 * Reset function - called before each test.
 */
function resetAll() {
	isCalledTaskDeleted = false;
	isSendEmailCalles = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function userNotVerifiedEmailSender() {
	let err = null;
	try {
		result = await userNotVerifiedEmailSenderRaw(mockTaskDetail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await userNotVerifiedEmailSender()).toEqual(null);
	expect(isCalledTaskDeleted).toEqual(isCalledTaskDeleted);
	expect(isSendEmailCalles).toEqual(true);
});
