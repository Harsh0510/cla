const extractUpdateRaw = require("../../core/public/extract-update");
let ctx;
let mockGetExtractLimitPercentage;
let mockGenerateExtractViewUrlsWrap;
let mockGetExtractPagesForCourse;
let mockGetCopyableSortedPages;
let mockGetExtractPagesForSchool;
let mockGetSchoolIdFromExtract;
let mockExtractData;
let mockResult;
let mockCourseData;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

jest.mock(`../../core/public/common/getExtractLimitPercentage`, () => {
	return function () {
		return mockGetExtractLimitPercentage;
	};
});

jest.mock(`../../core/public/common/generateExtractViewUrlsWrap`, () => {
	return function () {
		return mockGenerateExtractViewUrlsWrap;
	};
});

jest.mock(`../../common/getExtractPagesForCourse`, () => {
	return function () {
		return mockGetExtractPagesForCourse;
	};
});

jest.mock(`../../common/updateExtractCoursePage`, () => {
	return function () {
		return true;
	};
});

jest.mock(`../../core/public/common/getCopyableSortedPages`, () => {
	return function () {
		return mockGetCopyableSortedPages;
	};
});

jest.mock(`../../core/public/common/validateExtract`, () => {
	return function () {
		return true;
	};
});

jest.mock(`../../common/getExtractPagesForSchool`, () => {
	return function () {
		return mockGetExtractPagesForSchool;
	};
});

jest.mock(`../../common/updateExtractSchoolPage`, () => {
	return function () {
		return true;
	};
});

jest.mock(`../../core/public/common/getSchoolIdFromExtract`, () => {
	return function () {
		return mockGetSchoolIdFromExtract;
	};
});

jest.mock(`../../core/public/common/getTeacherName`, () => {
	return function () {
		return "test teacher";
	};
});

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
}

const asyncRunner = new (class {
	async pushTask() {
		return;
	}
})();

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("SELECT extract.id AS extract_id") !== -1) {
		return mockExtractData;
	}
	if (query.indexOf("SELECT id, title") !== -1) {
		return mockCourseData;
	}
	if (query.indexOf("UPDATE extract") !== -1) {
		return mockCourseData;
	}
	if (query.indexOf("INSERT INTO extract_status_change_event") !== -1) {
		return mockCourseData;
	}

	throw new Error("should not be here");
}

/** mock for isbn */
jest.mock("isbn", () => ({
	ISBN: {
		parse(a) {
			let p;
			if (a === "9781444144215") {
				p = {
					asIsbn13() {
						return a;
					},
					isValid() {
						return true;
					},
				};
			} else {
				p = {
					isValid() {
						return false;
					},
				};
			}
			return p;
		},
	},
}));

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = {
		assert(expr, status, msg) {
			if (expr) {
				return;
			}
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		throw(status, msg) {
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		getAppDbPool: (_) => ({
			connect: function () {
				return {
					query: async function (query) {
						if (query.indexOf("UPDATE") !== -1) {
							return mockResult;
						}
					},
					release: function () {
						return true;
					},
				};
			},
		}),
		async ensureLoggedIn() {
			return true;
		},
		async getSessionData() {
			return getGoodSessionData();
		},
		async appDbQuery(a, b) {
			return await getGoodAmmDbQuery(a, b);
		},
		async getClientIp() {
			return "127.0.0.1";
		},
		responseStatus: 200,
	};
	mockExtractData = {
		rows: [
			{
				extract_id: 5253,
				expired: false,
				date_created: "2021-08-10T13:40:33.670Z",
				course_id: 31914,
				course_oid: "9c75d936af48c7f77f398b8db23883eb8c99",
				course_name: "test 3",
				asset_id: 19879,
				asset_page_count: 200,
				copyable_page_count: 200,
				work_title: "CBAC Astudiaethau Crefyddol U2 Iddewiaeth",
				copy_excluded_pages: null,
				extract_status: "editable",
				grace_period_end: new Date(Date.now() + 3600 * 1000 * 24),
				pages: [1, 2, 3],
				school_name: "test school",
			},
		],
		rowCount: 1,
	};
	mockCourseData = {
		rows: [
			{
				id: 1,
				title: "title",
			},
		],
		rowCount: 1,
	};
	mockGetExtractLimitPercentage = { class: 0.05, school: 0.2 };
	mockGenerateExtractViewUrlsWrap = [
		"https://dummyimage.com/1200x1000/ee0000/333.png&text=1",
		"https://dummyimage.com/1200x1000/ee0000/333.png&text=2",
	];
	mockGetExtractPagesForCourse = [1, 2, 3];
	mockGetCopyableSortedPages = [1, 2, 3];
	mockGetExtractPagesForSchool = [1, 2, 3];
	mockGetSchoolIdFromExtract = 1;
	mockResult = {
		rowCount: 1,
	};
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

async function defaultGenerateExtractViewUrls(isbn13, pages, demoIP) {
	return new Array(pages.length);
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractUpdate(data, generateExtractViewUrls) {
	let err = null;
	generateExtractViewUrls = generateExtractViewUrls || defaultGenerateExtractViewUrls;
	try {
		ctx.body = await extractUpdateRaw(data, ctx, generateExtractViewUrls, asyncRunner);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		course_oid: "9c75d936af48c7f77f398b8db23883eb8c99",
		work_isbn13: "9781444144215",
		students_in_course: 5,
		exam_board: "OCR",
		extract_title: "My first extract!",
		pages: [4, 2, 8],
		extract_oid: "2a951b6289ec462facb8c40332ab99e41489",
		//rollover_review_oid: "84c3ab3b25e9a9c988c39b9a3e97a26771b8",
	};
}

test(`Error when invalid extract_oid is provided`, async () => {
	const params = getGoodParams();
	params.extract_oid = 5;
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: extract_oid invalid"));
});

test(`Error when requester is not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractUpdate(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Error when requester is not found extract`, async () => {
	const params = getGoodParams();
	mockExtractData.rowCount = 0;
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: extract not found"));
});

test(`Error when extract expired`, async () => {
	const params = getGoodParams();
	mockExtractData.rows[0].expired = true;
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: extract expired"));
});

test(`Error when asset not found`, async () => {
	const params = getGoodParams();
	mockExtractData.rows[0].asset_id = 0;
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: Asset not found"));
});

test(`Error when extract is active and not be editable`, async () => {
	const params = getGoodParams();
	mockExtractData.rows[0].extract_status = "active";
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: extract can not be editable"));
});

test(`Error when extract grace_period_end is expired`, async () => {
	const params = getGoodParams();
	mockExtractData.rows[0].grace_period_end = new Date("2020-08-24T13:40:33.670Z");
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: extract grace_period_end is expired"));
});

test(`Error when No copyable pages provided`, async () => {
	const params = getGoodParams();
	mockExtractData.rows[0].asset_page_count = 1;
	mockGetCopyableSortedPages = [];
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: No copyable pages provided"));
});

test(`Return exception error 'Supplied page exceeds asset page count'`, async () => {
	const params = getGoodParams();
	mockExtractData.rows[0].asset_page_count = 2;
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: Supplied page exceeds asset page count"));
});

test(`Error when Course not found`, async () => {
	const params = getGoodParams();
	mockCourseData.rows[0].id = 0;
	mockExtractData.rows[0].course_oid = "abc";
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: Course not found"));
});

test(`Success when user change course`, async () => {
	mockGetExtractLimitPercentage = { class: 0.05, school: 0.2 };
	const params = getGoodParams();
	mockExtractData.rows[0].course_oid = "9c75d936af48c7f77f398b8db23883eb8c90";
	expect(await extractUpdate(params)).toBe(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
});

test(`Success when user change pages`, async () => {
	mockGetExtractLimitPercentage = { class: 0.05, school: 0.2 };
	const params = getGoodParams();
	mockExtractData.rows[0].pages = [1, 2];
	expect(await extractUpdate(params)).toBe(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
});

test(`Error when extract would exceed limit for course`, async () => {
	mockGetExtractLimitPercentage = { class: 0.01, school: 0.2 };
	const params = getGoodParams();
	mockExtractData.rows[0].pages = [1, 2];
	mockExtractData.rows[0].copyable_page_count = 1;
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: Would exceed extract limit for course"));
});

test(`Error when extract would exceed limit for school`, async () => {
	mockGetExtractLimitPercentage = { class: 0.02, school: 0.02 };
	const params = getGoodParams();
	mockExtractData.rows[0].pages = [1, 2];
	mockExtractData.rows[0].copyable_page_count = 1;
	mockGetExtractPagesForCourse = [1];
	expect(await extractUpdate(params)).toEqual(new Error("400 ::: Would exceed extract limit for school"));
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	mockGetExtractLimitPercentage = { class: 0.05, school: 0.2 };
	const params = getGoodParams();
	mockExtractData.rows[0].course_oid = "9c75d936af48c7f77f398b8db23883eb8c90";
	ctx.getAppDbPool = (_) => ({
		connect: function () {
			return {
				query: async function (query) {
					query = query.replace(/\s+/g, " ");
					if (query.indexOf("UPDATE extract SET") !== -1) {
						mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
						mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
						return mockResult;
					}
				},
				release: function () {
					return true;
				},
			};
		},
	});
	expect(await extractUpdate(params)).toBe(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
