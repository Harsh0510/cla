const emailSenderLast = require("../../../../core/admin/async_task/rollover/emailSenderLast");

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
	await emailSenderLast("foo@bar.com", "John");
	expect(mockEmailCalls.length).toBe(1);
	const calls = mockEmailCalls[0];
	expect(calls[0]).toEqual(null);
	expect(calls[1]).toEqual("foo@bar.com");
	expect(calls[2]).toEqual("Education Platform rollover is complete: Login now to create your copies for the new year");
	expect(!!calls[3].content).toBe(true);
	expect(calls[3].content.indexOf("Dear John,") === 0).toBe(true);
	expect(calls[3].content.indexOf("We can confirm that rollover is now complete for your school.") >= 0).toBe(true);
	expect(calls[4]).toEqual(null);
	expect(calls[5]).toEqual("rollover-email-3-complete");
});
