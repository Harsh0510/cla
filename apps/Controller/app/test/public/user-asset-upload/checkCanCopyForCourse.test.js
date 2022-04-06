const checkCanCopyForCourseRaw = require("../../../core/public/user-asset-upload/checkCanCopyForCourse");

let querier;
let courseId;
let asset;
let pages;
let mockQueryReturn;

function resetAll() {
	querier = () => {
		return mockQueryReturn;
	};
	asset = {
		id: 456,
		copyable_page_count: 100,
	};
	courseId = 51;
	pages = [5, 10, 15];
	mockQueryReturn = {
		rows: [{ page_number: 5 }, { page_number: 6 }, { page_number: 7 }, { page_number: 8 }, { page_number: 9 }],
		rowCount: 5,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

const checkCanCopyForCourse = () => checkCanCopyForCourseRaw(querier, courseId, asset, pages);

test("When already exceeded limit 20%", async () => {
	mockQueryReturn = {
		rows: [
			{ page_number: 1 },
			{ page_number: 2 },
			{ page_number: 3 },
			{ page_number: 4 },
			{ page_number: 5 },
			{ page_number: 6 },
			{ page_number: 7 },
			{ page_number: 8 },
			{ page_number: 9 },
			{ page_number: 10 },
			{ page_number: 11 },
			{ page_number: 12 },
			{ page_number: 13 },
			{ page_number: 14 },
			{ page_number: 16 },
			{ page_number: 17 },
			{ page_number: 18 },
			{ page_number: 19 },
			{ page_number: 20 },
		],
		rowCount: 20,
	};
	await expect(checkCanCopyForCourse()).rejects.toThrow(
		"You have exceeded the copying allowance for this class. If this class was selected in error, please change your selection. If you've selected the correct class, please contact support for further clarification."
	);
});

test("When course limit exceeded 5%", async () => {
	mockQueryReturn = {
		rows: [
			{ page_number: 1 },
			{ page_number: 2 },
			{ page_number: 3 },
			{ page_number: 4 },
			{ page_number: 5 },
			{ page_number: 6 },
			{ page_number: 7 },
			{ page_number: 8 },
			{ page_number: 9 },
		],
		rowCount: 9,
	};
	await expect(checkCanCopyForCourse()).rejects.toThrow(
		"You have exceeded the copying allowance for this class. If this class was selected in error, please change your selection. If you've selected the correct class, please contact support for further clarification."
	);
});

test("When course limit less than 5% but new pages exceeded 20% limit", async () => {
	mockQueryReturn = {
		rows: [{ page_number: 1 }, { page_number: 2 }, { page_number: 3 }, { page_number: 4 }],
		rowCount: 9,
	};
	pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
	await expect(checkCanCopyForCourse()).rejects.toThrow(
		"The copying allowance for this book has already been reached. Please contact support for further clarification."
	);
});

test("Success", async () => {
	mockQueryReturn = {
		rows: [{ page_number: 1 }, { page_number: 2 }, { page_number: 3 }, { page_number: 4 }],
		rowCount: 9,
	};
	pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	await expect(await checkCanCopyForCourse()).toEqual(undefined);
});

test("When user copies same pages", async () => {
	mockQueryReturn = {
		rows: [{ page_number: 5 }, { page_number: 10 }, { page_number: 15 }],
		rowCount: 9,
	};
	await expect(await checkCanCopyForCourse()).toEqual(undefined);
});
