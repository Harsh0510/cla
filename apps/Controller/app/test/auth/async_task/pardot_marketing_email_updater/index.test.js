const Context = require("../../../common/Context");

const OLD_ENV = process.env;

let ctx, taskDetails;
let isTaskPushed = false;
let mockThrowException = false;

/** mock of notificationChecker */
jest.mock("../../../../core/auth/async_task/pardot_marketing_email_updater/notificationChecker", () => {
	return function pushTask(pushTaskObj) {
		isTaskPushed = true;
		return pushTaskObj;
	};
});

/** mock of pardot */
jest.mock("../../../../common/pardot/pardot", () => {
	return {
		upsertListMembership: () => {
			if (mockThrowException) {
				throw new Error();
			} else {
				return true;
			}
		},
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	isTaskPushed = false;
	mockThrowException = false;
	pushTaskObj = Object.create(null);
	pushTaskObj.key = "Test Key";
	pushTaskObj.callback = "Test CallBack";
	pushTaskObj.dateToExecute = new Date(Date.now() + 60 * 60 * 1000);
	mockSelectResult = {
		rowCount: 1,
		rows: [
			{
				user_id: 6,
				pardot_prospect_identifier: 31479925,
				receive_marketing_emails_update_counter: 0,
				receive_marketing_emails: "f",
			},
		],
	};
	taskDetails = {
		query: (query) => {
			let trimQuery = query.trim().replace(/\s+/g, " ");
			if (trimQuery.indexOf("SELECT") !== -1) {
				return mockSelectResult;
			}
			if (trimQuery.indexOf("INSERT") !== -1) {
				return true;
			}
		},
		deleteSelf: () => {
			return;
		},
	};
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Task is pushed Successfully`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const pardotMarketingEmailUpdaterRaw = require("../../../../core/auth/async_task/pardot_marketing_email_updater/index");
	async function pardotMarketingEmailUpdater(data) {
		let err = null;
		try {
			ctx.body = await pardotMarketingEmailUpdaterRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockUpsertListMembership = true;
	mockSelectResult.rowCount = 0;
	const item = await pardotMarketingEmailUpdater(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
});

test(`Get and update Pardot List Membership Successfully`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const pardotMarketingEmailUpdaterRaw = require("../../../../core/auth/async_task/pardot_marketing_email_updater/index");
	async function pardotMarketingEmailUpdater(data) {
		let err = null;
		try {
			ctx.body = await pardotMarketingEmailUpdaterRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const item = await pardotMarketingEmailUpdater(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
});

test(`Get Exception while updating pardot List`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const pardotMarketingEmailUpdaterRaw = require("../../../../core/auth/async_task/pardot_marketing_email_updater/index");
	async function pardotMarketingEmailUpdater(data) {
		let err = null;
		try {
			ctx.body = await pardotMarketingEmailUpdaterRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockThrowException = true;
	const item = await pardotMarketingEmailUpdater(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
});

test(`Return when CLA_PARDOT_API_PRIVATE_KEY is not passed `, async () => {
	const pardotMarketingEmailUpdaterRaw = require("../../../../core/auth/async_task/pardot_marketing_email_updater/index");
	async function pardotMarketingEmailUpdater(data) {
		let err = null;
		try {
			ctx.body = await pardotMarketingEmailUpdaterRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const item = await pardotMarketingEmailUpdater(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
});
