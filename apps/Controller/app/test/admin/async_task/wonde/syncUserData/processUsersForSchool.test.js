let mockGetUsersForSchool;
let mockInsertData;
let mockSendActivateEmail;
let mockUpsertWondeUsers;
let mockFunction;

jest.mock("../../../../../common/wonde/wonde.js", () => {
	return {
		async getUsersForSchool(...args) {
			return mockGetUsersForSchool(...args);
		},
	};
});

jest.mock("../../../../../core/admin/async_task/wonde/syncUserData/upsertWondeUsers.js", () => {
	return (...args) => mockUpsertWondeUsers(...args);
});

jest.mock("../../../../../common/sendEmail.js", () => {
	return () => {};
});

jest.mock("../../../../../core/auth/common/sendActivateEmail.js", () => {
	return (...args) => mockSendActivateEmail(...args);
});

jest.mock("../../../../../common/wait.js", () => {
	return () => {};
});

jest.mock("../../../../../core/admin/async_task/wonde/syncUserData/getFilteredRecords", () => {
	return {
		getExcludedWondeIdentifiers: async () => new Set(),
		getFilteredRecords: (_, records) => records,
	};
});

const processUsersForSchool = require("../../../../../core/admin/async_task/wonde/syncUserData/processUsersForSchool");

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockGetUsersForSchool = () => {};
	mockInsertData = async () => ({
		query: "",
		binds: [],
	});
	mockUpsertWondeUsers = () => [];
	mockSendActivateEmail = async () => {};
	mockFunction = jest.fn();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test("no results", async () => {
	mockGetUsersForSchool = () => {
		return {
			data: [],
			has_more: false,
		};
	};
	let wasCalled = false;
	mockUpsertWondeUsers = () => {
		wasCalled = true;
		return [];
	};
	await processUsersForSchool(null, "abc", 0);
	expect(wasCalled).toBe(false);
});

test("multiple pages of results", async () => {
	mockGetUsersForSchool = (_, page) => {
		return {
			data: [
				{
					page: page,
					idx: 0,
				},
				{
					page: page,
					idx: 1,
				},
				{
					page: page,
					idx: 2,
				},
			],
			has_more: page <= 1,
		};
	};
	mockUpsertWondeUsers = (a, b, wondeUsers) => {
		return wondeUsers.map((r) => {
			return { ...r, did_register: r.idx === 1 };
		});
	};
	let emailSentCount = 0;
	mockSendActivateEmail = () => {
		emailSentCount++;
	};
	await processUsersForSchool(null, "abc", 0);
	expect(emailSentCount).toBe(2); // two pages of results, each with one user that has did_register==TRUE
});
