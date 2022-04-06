const userTempUnlockedAssetEmailSenderRaw = require("../../../../core/public/async_task/asset_temp_unlock_reminder_email_sender/index");

let isCalledSendEmailByDaysFor_7_days = false;

jest.mock(`../../../../core/public/async_task/asset_temp_unlock_reminder_email_sender/pushTask`, () => {
	return function (task) {
		isPushedtoNotificationTask = true;
	};
});

jest.mock(`../../../../core/public/async_task/asset_temp_unlock_reminder_email_sender/sendEmailByDays`, () => {
	return function (taskDetails, days) {
		isCalledSendEmailByDaysFor_7_days = true;
	};
});

const mockTaskDetail = new (class TaskDetail {
	async deleteSelf() {
		isCalledTaskDeleted = true;
	}
})();

function resetAll() {
	isCalledSendEmailByDaysFor_7_days = false;
	isCalledTaskDeleted = false;
}
/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function userTempUnlockedAssetEmailSender() {
	let err = null;
	try {
		result = await userTempUnlockedAssetEmailSenderRaw(mockTaskDetail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await userTempUnlockedAssetEmailSender()).toEqual(null);
	expect(isCalledSendEmailByDaysFor_7_days).toEqual(true);
	expect(isCalledTaskDeleted).toEqual(true);
});
