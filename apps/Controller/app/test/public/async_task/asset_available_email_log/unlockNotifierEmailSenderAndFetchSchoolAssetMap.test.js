const unlockNotifierEmailSenderAndFetchSchoolAssetMap = require("../../../../core/public/async_task/asset_available_email_log/unlockNotifierEmailSenderAndFetchSchoolAssetMap");

let mockIsCalledEmailSender = false;
let mockAutoUnlockAssets = [];

let mockEmailSender;

jest.mock(`../../../../core/public/async_task/asset_available_email_log/getUserIdToAutoUnlockAssetMap`, () => {
	return function () {
		const userIdToAutoUnlockAssetMap = Object.create(null);
		isCalledGetUserIdToAutoUnlockAssetMap = true;
		for (const asset of mockAutoUnlockAssets) {
			if (!userIdToAutoUnlockAssetMap[asset.user_id]) {
				userIdToAutoUnlockAssetMap[asset.user_id] = [];
			}
			userIdToAutoUnlockAssetMap[asset.user_id].push(asset);
		}
		return userIdToAutoUnlockAssetMap;
	};
});

const mockQurier = async (query, data) => {
	return;
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockIsCalledEmailSender = false;
	mockEmailSender = async () => {
		mockIsCalledEmailSender = true;
	};
	mockAutoUnlockAssets = [
		{
			user_id: 14758,
			school_id: 365518,
			user_role: "school-admin",
			email: "bhadresh@cla.com",
			first_name: "Bhadresh",
			status: "does-not-exist",
			expiration_date: null,
			asset_id: 19880,
			authors_log: ["abc", "xyz"],
			publisher: "Illuminate Publishing",
			publication_date: "2019-12-05T00:00:00.000Z",
			edition: 1,
			title: "CBAC Astudiaethau Crefyddol U2: Bwdhaeth",
			pdf_isbn13: "9781911208938",
			should_receive_email: true,
		},
		{
			user_id: 14808,
			school_id: 365518,
			user_role: null,
			email: null,
			first_name: null,
			status: "does-not-exist",
			expiration_date: "2021-08-23T13:18:55.091Z",
			asset_id: 19880,
			authors_log: ["abc", "xyz"],
			publisher: "Illuminate Publishing",
			publication_date: "2019-12-05T00:00:00.000Z",
			edition: 1,
			title: "CBAC Astudiaethau Crefyddol U2: Bwdhaeth",
			pdf_isbn13: "9781911208938",
			should_receive_email: true,
		},
	];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Function renders correctly`, async () => {
	expect(await unlockNotifierEmailSenderAndFetchSchoolAssetMap(mockQurier, mockAutoUnlockAssets, mockEmailSender)).toEqual({
		"365518_19880": { school_id: 365518, asset_id: 19880 },
	});
	expect(mockIsCalledEmailSender).toBe(true);
});

test(`Send an email when temporary auto unlock assests is there`, async () => {
	expect(await unlockNotifierEmailSenderAndFetchSchoolAssetMap(mockQurier, mockAutoUnlockAssets, mockEmailSender)).toEqual({
		"365518_19880": { school_id: 365518, asset_id: 19880 },
	});
	expect(mockIsCalledEmailSender).toBe(true);
});

test(`Send an email when auto unlock assests is there`, async () => {
	expect(await unlockNotifierEmailSenderAndFetchSchoolAssetMap(mockQurier, mockAutoUnlockAssets, mockEmailSender)).toEqual({
		"365518_19880": { school_id: 365518, asset_id: 19880 },
	});
	expect(mockIsCalledEmailSender).toBe(true);
});

test(`Note send an email when user disable the unlock notification`, async () => {
	mockAutoUnlockAssets = [
		{
			user_id: 14758,
			school_id: 365518,
			user_role: "school-admin",
			email: "bhadresh@cla.com",
			first_name: "Bhadresh",
			status: "does-not-exist",
			expiration_date: null,
			asset_id: 19880,
			authors_log: ["abc", "xyz"],
			publisher: "Illuminate Publishing",
			publication_date: "2019-12-05T00:00:00.000Z",
			edition: 1,
			title: "CBAC Astudiaethau Crefyddol U2: Bwdhaeth",
			pdf_isbn13: "9781911208938",
			should_receive_email: false,
		},
	];
	expect(await unlockNotifierEmailSenderAndFetchSchoolAssetMap(mockQurier, mockAutoUnlockAssets, mockEmailSender)).toEqual({
		"365518_19880": { school_id: 365518, asset_id: 19880 },
	});
	expect(mockIsCalledEmailSender).toBe(false);
});
