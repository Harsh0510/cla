let mockSendEmailChunkCalls = [];
let mockDoRolloverCalls = [];
let mockDate;

jest.mock("../../../../core/admin/async_task/rollover/sendEmailChunk.js", () => {
	return (...args) => {
		mockSendEmailChunkCalls.push([...args]);
	};
});

jest.mock("../../../../core/admin/async_task/rollover/doRollover.js", () => {
	return (...args) => {
		mockDoRolloverCalls.push([...args]);
	};
});

const mockFirst = () => {};
const mockSecond = () => {};
const mockLast = () => {};

jest.mock("../../../../core/admin/async_task/rollover/emailSenderFirst.js", () => mockFirst);

jest.mock("../../../../core/admin/async_task/rollover/emailSenderSecond.js", () => mockSecond);

jest.mock("../../../../core/admin/async_task/rollover/emailSenderLast.js", () => mockLast);

const actions = require("../../../../core/admin/async_task/rollover/actions");

function resetAll() {
	mockDate = new Date();
	mockSendEmailChunkCalls = [];
	mockDoRolloverCalls = [];
}

beforeEach(resetAll);
afterEach(resetAll);

test("scheduled", async () => {
	await actions.scheduled(null, 12345, mockDate);

	expect(mockDoRolloverCalls.length).toBe(0);

	expect(mockSendEmailChunkCalls.length).toBe(1);
	expect(mockSendEmailChunkCalls[0][1]).toBe(12345);
	expect(mockSendEmailChunkCalls[0][2]).toBe(mockDate);
	expect(mockSendEmailChunkCalls[0][3]).toBe("rollover-email-1");
	expect(mockSendEmailChunkCalls[0][4]).toBe("rollover-email-1");
	expect(mockSendEmailChunkCalls[0][5]).toBe("target_execution_date - INTERVAL '1 day'");
	expect(mockSendEmailChunkCalls[0][6]).toBe(mockFirst);
});

test("rollover-email-1", async () => {
	await actions["rollover-email-1"](null, 12345, mockDate);

	expect(mockDoRolloverCalls.length).toBe(0);

	expect(mockSendEmailChunkCalls.length).toBe(1);
	expect(mockSendEmailChunkCalls[0][1]).toBe(12345);
	expect(mockSendEmailChunkCalls[0][2]).toBe(mockDate);
	expect(mockSendEmailChunkCalls[0][3]).toBe("rollover-email-2");
	expect(mockSendEmailChunkCalls[0][4]).toBe("rollover-email-2");
	expect(mockSendEmailChunkCalls[0][5]).toBe("target_execution_date");
	expect(mockSendEmailChunkCalls[0][6]).toBe(mockSecond);
});

test("rollover-email-2", async () => {
	const querier = (query) => {
		query = query.replace(/[\s\t\r\n]+/g, " ").trim();
		if (
			query.indexOf(
				`UPDATE rollover_job SET status = 'rolled-over', next_execution_date = target_execution_date + INTERVAL '2 weeks' WHERE id = $1`
			) !== -1
		) {
			return true;
		}
	};
	await actions["rollover-email-2"](querier, 12345);
	expect(mockDoRolloverCalls.length).toBe(1);
	expect(mockSendEmailChunkCalls.length).toBe(0);
});

test("rolled-over", async () => {
	await actions["rolled-over"](null, 12345, mockDate);

	expect(mockDoRolloverCalls.length).toBe(0);
	expect(mockSendEmailChunkCalls.length).toBe(1);
	expect(mockSendEmailChunkCalls[0][1]).toBe(12345);
	expect(mockSendEmailChunkCalls[0][2]).toBe(mockDate);
	expect(mockSendEmailChunkCalls[0][3]).toBe("rollover-email-3");
	expect(mockSendEmailChunkCalls[0][4]).toBe("completed");
	expect(mockSendEmailChunkCalls[0][5]).toBe("NULL");
	expect(mockSendEmailChunkCalls[0][6]).toBe(mockLast);
});
