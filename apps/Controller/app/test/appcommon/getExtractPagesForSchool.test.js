const getExtractPagesForSchool = require("../../common/getExtractPagesForSchool");
const Context = require("../common/Context");

let ctx;
let mockPages;
let mockData;
let querier = async (psqlQuery) => {
	if (psqlQuery.indexOf("SELECT") != -1) {
		return mockPages;
	}
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockPages = {
		rowCount: 1,
		rows: [
			{
				pages: [1, 2, 3, 4, 5],
			},
		],
	};
	mockData = {
		schoolId: 0,
		assetId: 123,
		extractId: 23,
		newPages: [],
		extractOid: "abc",
	};

	ctx = new Context();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Function render correctly`, async () => {
	mockData.newPages = [7, 8];
	const items = await getExtractPagesForSchool(querier, mockData.schoolId, mockData.assetId, mockData.extractId, mockData.newPages);
	expect(items).toEqual([1, 2, 3, 4, 5, 7, 8]);
});

test(`Function render correctly when oid is passed`, async () => {
	mockData.newPages = [7, 8];
	const items = await getExtractPagesForSchool(querier, mockData.schoolId, mockData.assetId, mockData.extractOid, mockData.newPages);
	expect(items).toEqual([1, 2, 3, 4, 5, 7, 8]);
});

test(`Function render correctly when newpages are not pass`, async () => {
	const items = await getExtractPagesForSchool(querier, mockData.schoolId, mockData.assetId, mockData.extractId);
	expect(items).toEqual([1, 2, 3, 4, 5]);
});
