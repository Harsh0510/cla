const mockSendEmailCalls = [];

jest.mock("../../../../../common/sendEmail.js", () => {
	return {
		sendTemplate(...args) {
			mockSendEmailCalls.push([...args]);
		},
	};
});

jest.mock("../../../../../common/getUrl.js", () => {
	return (segment) => {
		return "http://google.com" + segment;
	};
});

const sendMergeVerifyEmail = require("../../../../../core/auth/oauth/hwb/common/sendMergeVerifyEmail");

test("All is fine", async () => {
	sendMergeVerifyEmail("foo@bar.com", "XXX");
	expect(mockSendEmailCalls.length).toBe(1);
	expect(mockSendEmailCalls[0][0]).toBe(null);
	expect(mockSendEmailCalls[0][1]).toBe("foo@bar.com");
	expect(mockSendEmailCalls[0][2]).toBe("Education Platform - Verify yourself");
	const data = mockSendEmailCalls[0][3];
	expect(data.cta.url).toBe("http://google.com/auth/merge-verify/XXX");
	expect(mockSendEmailCalls[0][4]).toBe(null);
	expect(mockSendEmailCalls[0][5]).toBe("hwb-merge-verify");
});
