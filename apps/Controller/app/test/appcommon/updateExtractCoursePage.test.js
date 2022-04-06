const updateExtractCoursePageRaw = require("../../common/updateExtractCoursePage");
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
		courseId: 12,
		extractAssetCoursePages: [1, 2],
	};

	ctx = new Context();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function updateExtractCoursePage(assetId, courseId, extractAssetCoursePages) {
	let err = null;
	try {
		result = await updateExtractCoursePageRaw(querier, assetId, courseId, extractAssetCoursePages);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await updateExtractCoursePage(mockData.assetId, mockData.courseId, mockData.extractAssetCoursePages)).toEqual(null);
	expect(mockIsInsertQueryCalled).toEqual(true);
	expect(mockIsDeleteQueryCalled).toEqual(true);
});

test(`Function render correctly when extractAssetCoursePages are not pass`, async () => {
	expect(await updateExtractCoursePage(mockData.assetId, mockData.courseId, [])).toEqual(null);
	expect(mockIsDeleteQueryCalled).toEqual(true);
	expect(mockIsInsertQueryCalled).toEqual(false);
});
