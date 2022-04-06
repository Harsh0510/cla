const getUserAvailableAssetsList = require(`../../../../core/public/async_task/asset_available_email_log/getUserAvailableAssetsList`);

let mockUserAssetData;

jest.mock(`../../../../core/public/async_task/asset_available_email_log/getAssetDetail`, () => {
	return function () {
		return {
			assetUrl: "http://localhost:16000/works/9781911208938-cbac-astudiaethau-crefyddol-u2-bwdhaeth",
			assetCitation: "CBAC Astudiaethau Crefyddol U2: Bwdhaeth. Illuminate Publishing, 2019.",
			pdf_isbn13: "9781911208938",
		};
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockUserAssetData = [
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
		},
	];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Function render correctly`, async () => {
	expect(await getUserAvailableAssetsList(mockUserAssetData)).toEqual([
		'<li><a href="http://localhost:16000/works/9781911208938-cbac-astudiaethau-crefyddol-u2-bwdhaeth" target="_blank" title="CBAC Astudiaethau Crefyddol U2: Bwdhaeth">CBAC Astudiaethau Crefyddol U2: Bwdhaeth. Illuminate Publishing, 2019.</a></li>',
	]);
});

test(`Function render correctly when user assetdata is undefined`, async () => {
	mockUserAssetData = undefined;
	expect(await getUserAvailableAssetsList(mockUserAssetData)).toEqual([]);
});
