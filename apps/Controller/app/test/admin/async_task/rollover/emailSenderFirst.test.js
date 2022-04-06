const emailSenderFirst = require("../../../../core/admin/async_task/rollover/emailSenderFirst");

let mockEmailCalls = [];

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
	await emailSenderFirst("foo@bar.com", "John", {
		format(fmt) {
			return fmt;
		},
	});
	expect(mockEmailCalls.length).toBe(1);
	const calls = mockEmailCalls[0];
	expect(calls[0]).toEqual(null);
	expect(calls[1]).toEqual("foo@bar.com");
	expect(calls[2]).toEqual("Education Platform end of year rollover: What you need to know");
	expect(!!calls[3].content).toBe(true);
	expect(calls[3].content.indexOf("Dear John,") === 0).toBe(true);
	expect(calls[3].content.indexOf("ends on 31 July YYYY.") >= 0).toBe(true);
	expect(calls[3].content.indexOf("this will happen on D MMMM YYYY.") >= 0).toBe(true);
	expect(calls[4]).toEqual(null);
	expect(calls[5]).toEqual("rollover-email-1");
});
