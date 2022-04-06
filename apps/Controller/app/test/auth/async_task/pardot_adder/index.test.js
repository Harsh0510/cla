const Context = require("../../../common/Context");

const OLD_ENV = process.env;
let ctx, taskDetails;
let isTaskPushed = false;
let mockIsIncludeDateEdited;

/** mock of notificationChecker */
jest.mock("../../../../core/auth/async_task/pardot_adder/notificationChecker", () => {
	return function pushTask(pushTaskObj) {
		isTaskPushed = true;
		return pushTaskObj;
	};
});

/** mock of pardot */
jest.mock("../../../../common/pardot/pardot", () => {
	return {
		getProspect: () => {
			return mockGetProspectResult;
		},
		addProspect: () => {
			return mockAddProspectResult;
		},
		upsertListMembership: () => {
			return true;
		},
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	isTaskPushed = false;
	pushTaskObj = Object.create(null);
	pushTaskObj.key = "Test Key";
	pushTaskObj.callback = "Test CallBack";
	pushTaskObj.dateToExecute = new Date(Date.now() + 60 * 60 * 1000);
	mockSelectResult = {
		rowCount: 1,
		rows: [
			{
				id: 6,
				first_name: "tfa2name",
				last_name: "tfa2name",
				email: "teachera2@email.com",
				school_identifier: "200841/135208//",
				school_name: `St Paul's`,
				job_title: "Teacher",
				receive_marketing_emails: "f",
			},
		],
	};
	mockGetProspectResult = {
		status: 200,
		data: {
			"@attributes": {
				stat: "pass",
			},
			prospect: [{ updated_at: "2020:05:23" }],
		},
	};
	mockAddProspectResult = {
		prospect: [
			{
				id: 13,
				updated_at: "2020:05:23",
			},
		],
	};
	taskDetails = {
		query: (query) => {
			let trimQuery = query.trim().replace(/\s+/g, " ");
			if (trimQuery.indexOf("SELECT") !== -1) {
				return mockSelectResult;
			}
		},
		deleteSelf: () => {
			return;
		},
	};
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	mockIsIncludeDateEdited = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Task is pushed Successfully`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const pardotAdderRaw = require("../../../../core/auth/async_task/pardot_adder/index");
	async function pardotAdder(data) {
		let err = null;
		try {
			ctx.body = await pardotAdderRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockSelectResult.rowCount = 0;
	const item = await pardotAdder(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
});

test(`Get and Add prospect Successfully`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const pardotAdderRaw = require("../../../../core/auth/async_task/pardot_adder/index");
	async function pardotAdder(data) {
		let err = null;
		try {
			ctx.body = await pardotAdderRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const item = await pardotAdder(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
});

test(`Test if  not getting prospect`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const pardotAdderRaw = require("../../../../core/auth/async_task/pardot_adder/index");
	async function pardotAdder(data) {
		let err = null;
		try {
			ctx.body = await pardotAdderRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockGetProspectResult = null;
	const item = await pardotAdder(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
});

test(`Returns 0 if not getting prospect and not added`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const pardotAdderRaw = require("../../../../core/auth/async_task/pardot_adder/index");
	async function pardotAdder(data) {
		let err = null;
		try {
			ctx.body = await pardotAdderRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockAddProspectResult = null;
	mockGetProspectResult = null;
	const item = await pardotAdder(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
});

test(`Return when CLA_PARDOT_API_USER_KEY is not passed `, async () => {
	const pardotAdderRaw = require("../../../../core/auth/async_task/pardot_adder/index");
	async function pardotAdder(data) {
		let err = null;
		try {
			ctx.body = await pardotAdderRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	mockAddProspectResult = null;
	mockGetProspectResult = null;
	const item = await pardotAdder(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	process.env.CLA_PARDOT_API_PRIVATE_KEY = "user key";
	const pardotAdderRaw = require("../../../../core/auth/async_task/pardot_adder/index");
	taskDetails.query = (query) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT") !== -1) {
			return mockSelectResult;
		}
		if (trimQuery.indexOf("UPDATE cla_user AS m SET") !== -1) {
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
		}
	};
	async function pardotAdder(data) {
		let err = null;
		try {
			ctx.body = await pardotAdderRaw(data);
		} catch (e) {
			err = e;
		}
		return err;
	}
	const item = await pardotAdder(taskDetails);
	expect(item).toBeNull();
	expect(isTaskPushed).toEqual(true);
	expect(mockIsIncludeDateEdited).toBe(true);
});
