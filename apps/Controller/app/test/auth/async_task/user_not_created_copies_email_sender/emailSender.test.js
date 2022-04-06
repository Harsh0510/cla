const emailSenderRaw = require("../../../../core/auth/async_task/user_not_created_copies_email_sender/emailSender");

let mockData;
let isCalledEmailFunction;
// require(`../../../../common/sendEmail`);
jest.mock(`../../../../common/sendEmail`, () => {
	return {
		sendTemplate: async function (data) {
			isCalledEmailFunction = true;
		},
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockData = [
		{
			id: 1,
			email: "test1@testchool.com",
		},
		{
			id: 2,
			email: "test2@testchool.com",
		},
	];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function emailSender(data) {
	let err = null;
	try {
		result = await emailSenderRaw(data);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await emailSender(mockData)).toEqual(null);
	expect(isCalledEmailFunction).toEqual(true);
});
