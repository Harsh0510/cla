const getUserIdToAutoUnlockAssetMap = require("../../../../core/public/async_task/asset_available_email_log/getUserIdToAutoUnlockAssetMap");

let mockAutoUnlockAssets;

let mockAssetsData = [
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19816,
		authors_log: ["abc", "xyz"],
		publisher: "Illuminate Publishing",
		publication_date: "2019-01-28T00:00:00.000Z",
		edition: 1,
		title: "CBAC Tystysgrif a Diploma Cymhwysol Lefel 3 Troseddeg",
		pdf_isbn13: "9781912820139",
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
		should_receive_email: false,
	},
	{
		user_id: 14808,
		school_id: null,
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
		should_receive_email: false,
	},
	{
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "bhadresh@cla.com",
		first_name: "Bhadresh",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 19816,
		authors_log: ["abc", "xyz"],
		publisher: "Illuminate Publishing",
		publication_date: "2019-01-28T00:00:00.000Z",
		edition: 1,
		title: "CBAC Tystysgrif a Diploma Cymhwysol Lefel 3 Troseddeg",
		pdf_isbn13: "9781912820139",
		should_receive_email: false,
	},
];

const mockQurier = async (query, data) => {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`SELECT id, email, first_name, role`) !== -1) {
		return {
			rows: [
				{
					id: 14758,
					email: "bhadresh@cla.com",
					first_name: "Bhadresh",
					role: "school-admin",
					should_receive_email: true,
				},
			],
			rowCount: 1,
		};
	}
};
/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockAutoUnlockAssets = [];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Function render correctly`, async () => {
	const returnData = await getUserIdToAutoUnlockAssetMap(mockQurier, mockAutoUnlockAssets);
	expect(returnData).toEqual({});
});

test(`When user exixts in EP`, async () => {
	mockAutoUnlockAssets = [mockAssetsData[0]];
	const returnData = await getUserIdToAutoUnlockAssetMap(mockQurier, mockAutoUnlockAssets);
	expect(returnData).toEqual({
		"14758": [
			{
				user_id: 14758,
				school_id: 365518,
				user_role: "school-admin",
				email: "bhadresh@cla.com",
				first_name: "Bhadresh",
				status: "does-not-exist",
				expiration_date: null,
				asset_id: 19816,
				authors_log: ["abc", "xyz"],
				publisher: "Illuminate Publishing",
				publication_date: "2019-01-28T00:00:00.000Z",
				edition: 1,
				title: "CBAC Tystysgrif a Diploma Cymhwysol Lefel 3 Troseddeg",
				pdf_isbn13: "9781912820139",
				should_receive_email: true,
			},
		],
	});
});

test(`When user attempts to unlock multiple assets in EP`, async () => {
	mockAutoUnlockAssets = [mockAssetsData[0], mockAssetsData[3]];
	const returnData = await getUserIdToAutoUnlockAssetMap(mockQurier, mockAutoUnlockAssets);
	expect(returnData).toEqual({
		"14758": [
			{
				user_id: 14758,
				school_id: 365518,
				user_role: "school-admin",
				email: "bhadresh@cla.com",
				first_name: "Bhadresh",
				status: "does-not-exist",
				expiration_date: null,
				asset_id: 19816,
				authors_log: ["abc", "xyz"],
				publisher: "Illuminate Publishing",
				publication_date: "2019-01-28T00:00:00.000Z",
				edition: 1,
				title: "CBAC Tystysgrif a Diploma Cymhwysol Lefel 3 Troseddeg",
				pdf_isbn13: "9781912820139",
				should_receive_email: true,
			},
			{
				user_id: 14758,
				school_id: 365518,
				user_role: "school-admin",
				email: "bhadresh@cla.com",
				first_name: "Bhadresh",
				status: "does-not-exist",
				expiration_date: null,
				asset_id: 19816,
				authors_log: ["abc", "xyz"],
				publisher: "Illuminate Publishing",
				publication_date: "2019-01-28T00:00:00.000Z",
				edition: 1,
				title: "CBAC Tystysgrif a Diploma Cymhwysol Lefel 3 Troseddeg",
				pdf_isbn13: "9781912820139",
				should_receive_email: false,
			},
		],
	});
});

test(`When user no longer exixts in EP`, async () => {
	mockAutoUnlockAssets = [mockAssetsData[1]];
	const returnData = await getUserIdToAutoUnlockAssetMap(mockQurier, mockAutoUnlockAssets);
	expect(returnData).toEqual({
		"14758": [
			{
				user_id: 14758,
				school_id: 365518,
				user_role: "school-admin",
				email: "bhadresh@cla.com",
				first_name: "Bhadresh",
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
		],
	});
});

test(`When cla-admin attempts to unlock book for institution`, async () => {
	mockAutoUnlockAssets = [mockAssetsData[2]];
	const returnData = await getUserIdToAutoUnlockAssetMap(mockQurier, mockAutoUnlockAssets);
	expect(returnData).toEqual({
		"14758": [
			{
				user_id: 14758,
				school_id: null,
				user_role: "school-admin",
				email: "bhadresh@cla.com",
				first_name: "Bhadresh",
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
		],
	});
});

test(`When school don't have any school admin then email is not sent`, async () => {
	const mockQurier = async (query, data) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT id, email, first_name, role`) !== -1) {
			return {
				rows: [],
				rowCount: 0,
			};
		}
	};
	const returnData = await getUserIdToAutoUnlockAssetMap(mockQurier, mockAutoUnlockAssets);
	expect(returnData).toEqual({});
});
