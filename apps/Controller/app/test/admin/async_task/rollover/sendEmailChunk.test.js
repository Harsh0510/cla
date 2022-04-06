const sendsendEmailChunkRaw = require("../../../../core/admin/async_task/rollover/sendEmailChunk");
let mockUserResultData;
let mockIsInsertIntRrolloverProgress = false;
let mockIsUpdateRrolloverJob = false;
let mockIsCalledEmailSender = false;
let mockProps;
let mockEmailSenderResult = "";

jest.mock("../../../../common/customSetTimeout", () => {
	return function (method, time) {
		return setTimeout(method, 1);
	};
});

jest.mock("../../../../core/admin/async_task/rollover/interval", () => {
	// Number of milliseconds between runs
	return 10;
});

const mockTaskDetail = new (class TaskDetail {
	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT cla_user.id AS id,`) !== -1) {
			return mockUserResultData;
		} else if (query.indexOf(`INSERT INTO rollover_progress`) !== -1) {
			mockIsInsertIntRrolloverProgress = true;
			return;
		} else if (query.indexOf(`UPDATE rollover_job`) !== -1) {
			mockIsUpdateRrolloverJob = true;
			return;
		}
	}
})();

let mockThrowEmailSenderError = async () => {
	mockIsCalledEmailSender = true;
	throw "Something has been wrong!";
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockIsCalledEmailSender = false;
	mockIsInsertIntRrolloverProgress = false;
	mockIsUpdateRrolloverJob = false;
	mockEmailSenderResult = "";
	mockProps = {
		rolloverJobId: 1,
		targetExecutionDate: "2021-08-21 11:40:48.212363+00",
		rolloverStatus: "rollover-email-1",
		nextStatus: "rollover-email-1",
		nextExecutionDate: "target_execution_date - INTERVAL '1 day'",
		emailSendFunc: async () => {
			mockIsCalledEmailSender = true;
			return mockEmailSenderResult;
		},
	};
	mockUserResultData = {
		rowCount: 2,
		rows: [
			{
				id: 1,
				email: "test1@testchool.com",
				first_name: "foo bar",
				should_receive_email: true,
			},
			{
				id: 2,
				email: "test2@testchool.com",
				first_name: "Zoo bar",
				should_receive_email: false,
			},
		],
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function sendsendEmailChunk(mockData) {
	let err = null;
	try {
		result = await sendsendEmailChunkRaw(
			mockTaskDetail.query,
			mockData.rolloverJobId,
			mockData.targetExecutionDate,
			mockData.rolloverStatus,
			mockData.nextStatus,
			mockData.nextExecutionDate,
			mockData.emailSendFunc
		);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	mockEmailSenderResult = "";
	expect(await sendsendEmailChunk(mockProps)).toEqual(null);
	expect(mockIsInsertIntRrolloverProgress).toEqual(true);
	expect(mockIsCalledEmailSender).toEqual(true);
});

test(`Function render correctly when no users found`, async () => {
	mockEmailSenderResult = "";
	mockUserResultData = {
		rowCount: 0,
		rows: [],
	};
	expect(await sendsendEmailChunk(mockProps)).toEqual(null);
	expect(mockIsInsertIntRrolloverProgress).toEqual(false);
	expect(mockIsCalledEmailSender).toEqual(false);
	expect(mockIsUpdateRrolloverJob).toEqual(true);
});

test(`When user disbale "Receive emails with information about the end of the Licence year (“Rollover”) annually"`, async () => {
	mockEmailSenderResult = "";
	mockUserResultData = {
		rowCount: 1,
		rows: [
			{
				id: 2,
				email: "test2@testchool.com",
				first_name: "Zoo bar",
				should_receive_email: false,
			},
		],
	};
	const result = await sendsendEmailChunk(mockProps);
	expect(result).toEqual(null);
	expect(mockIsInsertIntRrolloverProgress).toEqual(true);
	expect(mockIsCalledEmailSender).toEqual(false);
});

test(`When user enable the notification but not able to send an email than not log into log table`, async () => {
	mockEmailSenderResult = "";
	global.console = {
		error: jest.fn(),
	};
	mockUserResultData = {
		rowCount: 1,
		rows: [
			{
				id: 2,
				email: "test2@testchool.com",
				first_name: "Zoo bar",
				should_receive_email: true,
			},
		],
	};
	mockProps.emailSendFunc = mockThrowEmailSenderError;
	const result = await sendsendEmailChunk(mockProps);
	expect(result).toEqual(null);
	expect(mockIsInsertIntRrolloverProgress).toEqual(false);
	expect(mockIsCalledEmailSender).toEqual(true);
	expect(mockIsUpdateRrolloverJob).toEqual(false);
});
