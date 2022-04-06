import shareExtractBodyContentString from "../shareExtractBodyContentString";
let mockAuthors, mockData, mockAccessCode;
jest.mock("../misc", () => {
	return {
		getLongFormContributors: () => {
			return mockAuthors;
		},
	};
});

const resetAll = () => {
	mockAuthors = {
		authors: [
			{
				firstName: "Peter",
				lastName: "Clarke",
			},
		],
	};
	mockData = {
		title: "Test Extract Title",
		work_title: "Test Book",
		work_publisher: "Test work Publisher",
		school_name: "Test School Name",
		teacher: "School teacher name",
		date_created: "2020-04-08T10:28:48.091Z",
		date_expired: "2020-07-08T10:28:48.090Z",
		imprint: "Test School Imprint",
		work_authors: [
			{
				firstName: "Peter",
				lastName: "Clarke",
				role: "A",
			},
		],
	};
	mockAccessCode: null;
};

beforeEach(resetAll);
afterEach(resetAll);

test(`Renders correctly`, () => {
	const result = shareExtractBodyContentString(mockData, mockAccessCode);
	expect(result).not.toEqual(null);
});

test(`Get the string including with the access code string`, () => {
	mockAccessCode = "788339";
	const result = shareExtractBodyContentString(mockData, mockAccessCode);
	expect(result).not.toEqual(null);
	expect(result.indexOf(mockAccessCode) !== -1).toEqual(true);
});
