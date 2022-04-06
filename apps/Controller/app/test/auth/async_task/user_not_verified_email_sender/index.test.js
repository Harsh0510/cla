const userNotVerifiedEmailSenderRaw = require("../../../../core/auth/async_task/user_not_verified_email_sender/index");
let isCalledFor_3_days = false;
let isCalledFor_10_days = false;
let isCalledFor_17_days = false;
let isCalledTaskDeleted = false;
jest.mock(`../../../../core/auth/async_task/user_not_verified_email_sender/pushTask`, () => {
	return function (task) {
		isPushedtoNotificationTask = true;
	};
});
jest.mock(`../../../../core/auth/async_task/user_not_verified_email_sender/sendEmailByHours`, () => {
	return function (taskDetails, hours) {
		if (hours === 71) {
			isCalledFor_3_days = true;
		} else if (hours === 239) {
			isCalledFor_10_days = true;
		} else if (hours === 407) {
			isCalledFor_17_days = true;
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
	isCalledFor_3_days = false;
	isCalledFor_10_days = false;
	isCalledFor_17_days = false;
	isCalledTaskDeleted = false;
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
	expect(isCalledFor_3_days).toEqual(true);
	expect(isCalledFor_10_days).toEqual(true);
	expect(isCalledFor_17_days).toEqual(true);
	expect(isCalledTaskDeleted).toEqual(isCalledTaskDeleted);
});
