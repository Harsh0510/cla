const getAssetDetail = require(`../../../../core/public/async_task/asset_available_email_log/getAssetDetail`);

jest.mock(`../../../../common/getUrl`, () => {
	return function () {
		return "http://localhost:16000/works/9781847628862-ks3-spanish-study-guide";
	};
});

jest.mock(`../../../../core/public/async_task/asset_available_email_log/getAssetCitationText`, () => {
	return function () {
		return "KS3 Spanish Study Guide. Coordination Group Publications";
	};
});

jest.mock(`../../../../core/public/async_task/asset_available_email_log/misc`, () => {
	return {
		getURLEncodeAsset: function () {
			return "9781847628862-ks3-spanish-study-guide";
		},
	};
});

function resetAll() {
	props = {
		user_id: 14758,
		school_id: 365518,
		user_role: "school-admin",
		email: "joseph@cla.com",
		first_name: "joseph",
		status: "does-not-exist",
		expiration_date: null,
		asset_id: 16,
		authors_log: [
			{ role: "A", lastName: "Books", firstName: "CGP" },
			{ role: "B", lastName: "Books", firstName: "CGP" },
		],
		publisher: "Coordination Group Publications",
		publication_date: "2013-02-13T00:00:00.000Z",
		edition: 1,
		title: "KS3 Spanish Study Guide",
		pdf_isbn13: "9781847628862",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Function render correctly`, async () => {
	expect(await getAssetDetail({ ...props })).toEqual({
		assetCitation: "KS3 Spanish Study Guide. Coordination Group Publications",
		assetUrl: "http://localhost:16000/works/9781847628862-ks3-spanish-study-guide",
		pdf_isbn13: "9781847628862",
	});
});
