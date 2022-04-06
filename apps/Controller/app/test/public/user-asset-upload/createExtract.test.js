let mockCanCopyForCourse;
let mockCanCopyForSchool;
let mockCourseDetails;

jest.mock("#tvf-util", () => {
	return {
		async generateObjectIdentifier() {
			return "1".repeat(36);
		},
	};
});

jest.mock(`../../../common/getExtractExpiryDate`, () => {
	return () => "abc123";
});

jest.mock(`../../../core/public/common/getExtractLimitPercentage`, () => {
	return async () => ({
		school: 0.2,
		class: 0.05,
	});
});

jest.mock(`../../../core/public/user-asset-upload/checkCanCopyForCourse`, () => {
	return async () => mockCanCopyForCourse;
});

jest.mock(`../../../core/public/extract-create/canCopyForSchool`, () => {
	return async () => mockCanCopyForSchool;
});

jest.mock(`../../../core/public/extract-create/getCourseDetails`, () => {
	return async () => mockCourseDetails;
});

const createExtractRaw = require("../../../core/public/user-asset-upload/createExtract");

let querier;
let asyncTaskPush;
let asset;
let assetUserUploadId;
let userId;
let courseOid;
let schoolId;
let pages;
let title;

function resetAll() {
	mockCanCopyForCourse = true;
	mockCanCopyForSchool = true;
	mockCourseDetails = {
		id: 123,
		title: "Test",
		academic_year_end_month: 5,
		academic_year_end_day: 10,
	};
	querier = () => {};
	asyncTaskPush = () => {};
	asset = {
		id: 456,
	};
	assetUserUploadId = 789;
	userId = 1122;
	courseOid = "2".repeat(36);
	schoolId = 3344;
	pages = [5, 10, 15];
	title = "Title here";
}

beforeEach(resetAll);
afterEach(resetAll);

const createExtract = () => createExtractRaw(querier, asyncTaskPush, asset, assetUserUploadId, userId, courseOid, schoolId, pages, title);

test("course not found", async () => {
	mockCourseDetails = null;
	await expect(createExtract()).rejects.toThrow("Course not found");
});

test("exceed school extract limit", async () => {
	mockCanCopyForSchool = false;
	await expect(createExtract()).rejects.toThrow("Would exceed extract limit for school");
});

test("success", async () => {
	expect(await createExtract()).toBe("1".repeat(36));
});
