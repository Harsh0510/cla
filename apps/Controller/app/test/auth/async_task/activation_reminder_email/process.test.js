jest.mock(`../../../../core/auth/async_task/activation_reminder_email/emailSender`, () => {
	return {
		firstEmailReminderA() {},
		firstEmailReminderB() {},
		secondEmailReminderA() {},
		secondEmailReminderB() {},
		thirdEmailReminderA() {},
		thirdEmailReminderB() {},
	};
});

const processRaw = require("../../../../core/auth/async_task/activation_reminder_email/process");

let mockResults;

const mockQuerier = (query, data) => {
	if (query.text && !data) {
		data = query.values;
		query = query.text;
	}
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`UPDATE cla_user`) !== -1) {
		return {
			rowCount: mockResults.length,
			rows: mockResults,
		};
	}
	if (query.includes("activation_reminder_email_send_log")) {
		return {
			rowCount: 0,
			rows: [],
		};
	}
	throw new Error("should never be here");
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockResults = [];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function process(querier) {
	let err = null;
	try {
		result = await processRaw(mockQuerier);
	} catch (e) {
		err = e;
	}
	return err;
}

test("no results", async () => {
	mockResults = [];
	expect(await process(() => {})).toBeFalsy();
});

test("results", async () => {
	mockResults = [
		{
			id: 123,
			email: "a@b.c",
			last_name: "A",
			title: "Mx",
			reminder_email_index: 1,
			activation_token: "xxx",
		},
		{
			id: 456,
			email: "d@e.f",
			last_name: "B",
			title: "Mx",
			reminder_email_index: 2,
			activation_token: "yyy",
		},
		{
			id: 789,
			email: "g@h.i",
			last_name: "C",
			title: "Mx",
			reminder_email_index: 3,
			activation_token: "zzz",
		},
	];
	expect(await process(() => {})).toBeFalsy();
});

test("When user recieves reminder email B ", async () => {
	global.Math.random = () => 0.8;
	mockResults = [
		{
			id: 123,
			email: "a@b.c",
			last_name: "A",
			title: "Mx",
			reminder_email_index: 1,
			activation_token: "xxx",
		},
		{
			id: 456,
			email: "d@e.f",
			last_name: "B",
			title: "Mx",
			reminder_email_index: 2,
			activation_token: "yyy",
		},
		{
			id: 789,
			email: "g@h.i",
			last_name: "C",
			title: "Mx",
			reminder_email_index: 3,
			activation_token: "zzz",
		},
	];
	expect(await process(() => {})).toBeFalsy();
});
