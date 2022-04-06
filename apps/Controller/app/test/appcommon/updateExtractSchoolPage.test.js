const updateExtractSchoolPageRaw = require("../../common/updateExtractSchoolPage");
const Context = require("../common/Context");

let ctx;
let mockData;
let mockIsInsertQueryCalled = false;
let mockIsDeleteQueryCalled = false;
let querier = async (psqlQuery) => {
	if (psqlQuery.indexOf("DELETE FROM") != -1) {
		mockIsDeleteQueryCalled = true;
		return true;
	}
	if (psqlQuery.indexOf("INSERT INTO") != -1) {
		mockIsInsertQueryCalled = true;
		return true;
	}
	return false;
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockIsInsertQueryCalled = false;
	mockIsDeleteQueryCalled = false;
	mockData = {
		assetId: 123,
		schoolId: 12,
		extractAssetSchoolPagesMap: [1, 2],
	};

	ctx = new Context();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function updateExtractSchoolPage(assetId, schoolId, extractAssetSchoolPagesMap) {
	let err = null;
	try {
		result = await updateExtractSchoolPageRaw(querier, assetId, schoolId, extractAssetSchoolPagesMap);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await updateExtractSchoolPage(mockData.assetId, mockData.schoolId, mockData.extractAssetSchoolPagesMap)).toEqual(null);
	expect(mockIsInsertQueryCalled).toEqual(true);
	expect(mockIsDeleteQueryCalled).toEqual(true);
});

test(`Function render correctly when extractAssetSchoolPagesMap are not pass`, async () => {
	expect(await updateExtractSchoolPage(mockData.assetId, mockData.schoolId, [])).toEqual(null);
	expect(mockIsDeleteQueryCalled).toEqual(true);
	expect(mockIsInsertQueryCalled).toEqual(false);
});
