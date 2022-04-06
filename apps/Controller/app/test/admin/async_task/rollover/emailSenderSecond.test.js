const emailSenderSecond = require("../../../../core/admin/async_task/rollover/emailSenderSecond");

let mockEmailCalls = [];

const mockMomentObject = {
	format(fmt) {
		if (fmt === "YYYY") {
			return "2025";
		} else if (fmt === "D MMMM YYYY") {
			return "5 June 2025";
		}
		throw new Error("should never get here");
	},
};

jest.mock("moment", () => () => mockMomentObject);

jest.mock("../../../../common/sendEmail.js", () => {
	return {
		sendTemplate: (...args) => {
			mockEmailCalls.push([...args]);
		},
	};
});

function resetAll() {
	mockEmailCalls = [];
}

beforeEach(resetAll);
afterEach(resetAll);

test("works", async () => {
	await emailSenderSecond("foo@bar.com", "John", mockMomentObject);
	expect(mockEmailCalls.length).toBe(1);
	const calls = mockEmailCalls[0];
	expect(calls[0]).toEqual(null);
	expect(calls[1]).toEqual("foo@bar.com");
	expect(calls[2]).toEqual("Reminder: A new academic year starts on the Education Platform tomorrow");
	expect(!!calls[3].content).toBe(true);
	expect(calls[3].content.indexOf("Dear John,") === 0).toBe(true);
	expect(calls[3].content.indexOf("tomorrow, on 5 June 2025") >= 0).toBe(true);
	expect(calls[3].content.indexOf("Please login on or after 5 June 2025 to create new copies for 2025/26") >= 0).toBe(true);
	expect(calls[4]).toEqual(null);
	expect(calls[5]).toEqual("rollover-email-2");
});
