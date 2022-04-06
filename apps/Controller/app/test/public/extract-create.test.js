const extractCreateRaw = require("../../core/public/extract-create");
let ctx, mockGetExtractLimitPercentage, mockGenerateExtractViewUrlsWrap;
let mockIsIncludeModifyUserIdForExtract;
let mockIsIncludeDateEditedForExtract;
let mockIsIncludeModifyUserIdForExtractShare;
let mockIsIncludeDateEditedForExtractShare;
let mockIsIncludeModifyUserIdForCourse;
let mockIsIncludeDateEditedForCourse;
let mockCourseDetails;
let mockAssetDetails;
let mockIsCanCopyForCourse;
let mockIsCanCopyForSchool;

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

jest.mock(`../../core/public/common/validateExtract`, () => {
	return function () {
		return true;
	};
});

jest.mock(`../../core/public/extract-create/getCourseDetails`, () => {
	return function () {
		return mockCourseDetails;
	};
});

jest.mock(`../../core/public/extract-create/getAsset`, () => {
	return function () {
		return mockAssetDetails;
	};
});

jest.mock(`../../core/public/extract-create/canCopyForCourse`, () => {
	return function () {
		return mockIsCanCopyForCourse;
	};
});

jest.mock(`../../core/public/extract-create/canCopyForSchool`, () => {
	return function () {
		return mockIsCanCopyForSchool;
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
	if (query.indexOf(" FROM extract_page ") !== -1) {
		return {
			rows: [{ page_number: 2 }, { page_number: 7 }, { page_number: 5 }],
		};
	}
	if (query.indexOf(" FROM extract_page_by_school ") !== -1) {
		return {
			rows: [{ page_number: 2 }, { page_number: 7 }, { page_number: 5 }],
		};
	}
	if (query.indexOf("INSERT INTO extract ") !== -1) {
		return {
			rows: [{ date_created: "2018-01-14T00:00:00.000Z" }],
		};
	}
	if (query.indexOf("INSERT INTO extract_page ") !== -1) {
		return {
			rows: [],
		};
	}
	if (query.indexOf("INSERT INTO extract_page_by_school ") !== -1) {
		return {
			rows: [],
		};
	}
	if (query.indexOf("SELECT id, pages, COALESCE(date_expired <= NOW(), FALSE) AS expired, date_created FROM extract WHERE oid") !== -1) {
		return {
			rows: [{ pages: [1, 2, 3, 4], expired: true, date_created: "2021-06-11 05:27:05.632555" }],
			rowCount: 1,
		};
	}
	if (query.indexOf(" AS teacher_name FROM cla_user") !== -1) {
		return {
			rows: [{ teacher_name: "mock teacher" }],
			rowCount: 1,
		};
	}
	if (query.indexOf("UPDATE extract SET date_expired") !== -1) {
		return { rows: [] };
	}
	if (query.indexOf("UPDATE course SET number_of_students") !== -1) {
		return { rows: [] };
	}
	if (query.indexOf("UPDATE extract_share SET date_expired = $1") !== -1) {
		return null;
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
	mockGetExtractLimitPercentage = { class: 0.05, school: 0.2 };
	mockGenerateExtractViewUrlsWrap = [
		"https://dummyimage.com/1200x1000/ee0000/333.png&text=1",
		"https://dummyimage.com/1200x1000/ee0000/333.png&text=2",
	];
	mockIsIncludeModifyUserIdForExtract = false;
	mockIsIncludeDateEditedForExtract = false;
	mockIsIncludeModifyUserIdForExtractShare = false;
	mockIsIncludeDateEditedForExtractShare = false;
	mockIsIncludeModifyUserIdForCourse = false;
	mockIsIncludeDateEditedForCourse = false;
	mockCourseDetails = [{ id: 123, title: "Test class", academic_year_end_month: 7, academic_year_end_day: 31 }];
	mockAssetDetails = [{ id: 456, page_count: 10, copyable_page_count: 10, copy_excluded_pages: [1, 2] }];
	mockIsCanCopyForCourse = true;
	mockIsCanCopyForSchool = true;
}

async function defaultGenerateExtractViewUrls(isbn13, pages, demoIP) {
	return new Array(pages.length);
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractCreate(data, generateExtractViewUrls) {
	let err = null;
	generateExtractViewUrls = generateExtractViewUrls || defaultGenerateExtractViewUrls;
	try {
		ctx.body = await extractCreateRaw(data, ctx, generateExtractViewUrls, asyncRunner);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		course_oid: "a".repeat(36),
		work_isbn13: "9781444144215",
		students_in_course: 5,
		exam_board: "OCR",
		extract_title: "My first extract!",
		pages: [4, 2, 8],
		//rollover_review_oid: "84c3ab3b25e9a9c988c39b9a3e97a26771b8",
	};
}

test(`Error when requester is not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractCreate(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Error when user log in with cla-admin`, async () => {
	const params = getGoodParams();
	ctx.getSessionData = async (_) => {
		const s = getGoodSessionData();
		s.user_role = "cla-admin";
		return s;
	};
	expect(await extractCreate(params)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when course is not found`, async () => {
	const params = getGoodParams();
	mockCourseDetails = null;
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Course not found"));
});

test(`Error when asset is not found`, async () => {
	const params = getGoodParams();
	mockAssetDetails = null;
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Asset not found"));
});

test(`Error when extract would exceed limit for course`, async () => {
	mockIsCanCopyForCourse = false;
	const params = getGoodParams();
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Would exceed extract limit for course"));
});

test(`Error when extract would exceed limit for course for excluded pages`, async () => {
	mockIsCanCopyForCourse = false;
	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM asset ") !== -1) {
			return {
				rows: [{ id: 456, page_count: 1000, copyable_page_count: 10 }],
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Would exceed extract limit for course"));
});

test(`Success!`, async () => {
	mockGetExtractLimitPercentage = { class: 0.05, school: 0.2 };

	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM asset ") !== -1) {
			return {
				rows: [{ id: 1, page_count: 100, copyable_page_count: 100, title: "test" }],
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toBe(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
});

test(`Return exception error 'Supplied page exceeds asset page count'`, async () => {
	const params = getGoodParams();
	params.pages.push(20);
	mockAssetDetails = { id: 456, page_count: 10, copyable_page_count: 10, copy_excluded_pages: [1, 2] };
	ctx.appDbQuery = async (query, values) => {
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Supplied page exceeds asset page count"));
});

test(`Error when extract would exceed limit for school`, async () => {
	const params = getGoodParams();
	params.pages = [5];
	mockIsCanCopyForSchool = false;
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Would exceed extract limit for school"));
});

/** here 'exam_board' set the null value */
test(`Success! even if you have not passed 'exam_board' value`, async () => {
	const params = getGoodParams();
	delete params.exam_board;
	expect(await extractCreate(params)).toBe(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
});

/** here 'exam_board' set the null value */
test(`Success! even if you have not get 'academic_year_end_month' and 'academic_year_end_day' value as null`, async () => {
	const params = getGoodParams();
	delete params.exam_board;
	expect(await extractCreate(params)).toBe(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
});

test(`When user review an extract and invalid rollover_review_oid is provided`, async () => {
	const params = getGoodParams();
	params.rollover_review_oid = 5;
	expect(await extractCreate(params)).toEqual(new Error("400 ::: rollover_review_oid invalid"));
});

test(`Error When user review an extract and extract not found`, async () => {
	const params = getGoodParams();
	params.rollover_review_oid = "84c3ab3b25e9a9c988c39b9a3e97a26771b8";
	ctx.appDbQuery = async (query, values) => {
		const sqlQuery = query.replace(/\s+/g, " ");
		if (sqlQuery.indexOf("FROM asset ") !== -1) {
			return {
				rows: [{ id: 456, page_count: 1000, copyable_page_count: 1000 }],
			};
		} else if (sqlQuery.indexOf("date_created FROM extract ") !== -1) {
			return {
				rows: [],
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Extract not found"));
});

test(`When user review an extract`, async () => {
	const params = getGoodParams();
	params.pages = [1, 2, 3, 4];
	params.rollover_review_oid = "8223b713aa71415463f183856681f9ab6033";
	expect(await extractCreate(params)).toEqual(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
});

test(`When user review an extract and update number_of_students`, async () => {
	const params = getGoodParams();
	params.pages = [1, 2, 3, 4];
	params.rollover_review_oid = "8223b713aa71415463f183856681f9ab6033";
	params.setCourseDefaultNoOfStudent = true;
	expect(await extractCreate(params)).toEqual(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
});

test(`When user review an extract and update pages`, async () => {
	const params = getGoodParams();
	params.pages = [1, 2, 3, 5];
	params.rollover_review_oid = "8223b713aa71415463f183856681f9ab6033";
	params.setCourseDefaultNoOfStudent = true;
	expect(await extractCreate(params)).toEqual(null);
	expect(ctx.body.extract.pages).toEqual([1, 2, 3, 5]);
	expect(ctx.body.extract.oid).not.toEqual("8223b713aa71415463f183856681f9ab6033");
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const params = getGoodParams();
	params.pages = [1, 2, 3, 4];
	params.rollover_review_oid = "8223b713aa71415463f183856681f9ab6033";
	params.setCourseDefaultNoOfStudent = true;
	ctx.appDbQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("FROM asset ") !== -1) {
			return {
				rows: [{ id: 1, page_count: 100, copyable_page_count: 200, title: "test" }],
			};
		}
		if (query.indexOf("UPDATE extract SET") !== -1) {
			mockIsIncludeModifyUserIdForExtract = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedForExtract = query.indexOf("date_edited") !== -1 ? true : false;
		}
		if (query.indexOf("UPDATE extract_share SET") !== -1) {
			mockIsIncludeModifyUserIdForExtractShare = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedForExtractShare = query.indexOf("date_edited") !== -1 ? true : false;
		}
		if (query.indexOf("UPDATE course SET") !== -1) {
			mockIsIncludeModifyUserIdForCourse = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedForCourse = query.indexOf("date_edited") !== -1 ? true : false;
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toEqual(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
	expect(mockIsIncludeModifyUserIdForExtract).toBe(true);
	expect(mockIsIncludeDateEditedForExtract).toBe(true);
	expect(mockIsIncludeModifyUserIdForExtractShare).toBe(true);
	expect(mockIsIncludeDateEditedForExtractShare).toBe(true);
	expect(mockIsIncludeModifyUserIdForCourse).toBe(true);
	expect(mockIsIncludeDateEditedForCourse).toBe(true);
});

test(`When user clone existing extract`, async () => {
	const params = getGoodParams();
	params.pages = [1, 2, 3];
	params.clone_from_extract_oid = "8223b713aa71415463f183856681f9ab6033";
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM asset ") !== -1) {
			return {
				rows: [{ id: 1, page_count: 100, copyable_page_count: 100, title: "test" }],
			};
		}
		if (query.replace(/\s+/g, " ").indexOf("SELECT id, status") !== -1) {
			return {
				rows: [{ id: 1, status: "active", expired: false, school_id: 153 }],
				rowCount: 1,
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toEqual(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls.length).toBe(2);
});

test(`When user clone cancelled extract`, async () => {
	const params = getGoodParams();
	params.pages = [1, 2, 3];
	params.clone_from_extract_oid = "8223b713aa71415463f183856681f9ab6033";
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM asset ") !== -1) {
			return {
				rows: [{ id: 1, page_count: 100, copyable_page_count: 100, title: "test" }],
			};
		}
		if (query.replace(/\s+/g, " ").indexOf("SELECT id, status") !== -1) {
			return {
				rows: [{ id: 1, status: "cancelled", expired: false, school_id: 153 }],
				rowCount: 1,
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Extract not cloneable"));
});

test(`When user tried to clone extract from another institution extract`, async () => {
	const params = getGoodParams();
	params.pages = [1, 2, 3];
	params.clone_from_extract_oid = "8223b713aa71415463f183856681f9ab6033";
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM asset ") !== -1) {
			return {
				rows: [{ id: 1, page_count: 100, copyable_page_count: 100, title: "test" }],
			};
		}
		if (query.replace(/\s+/g, " ").indexOf("SELECT id, status") !== -1) {
			return {
				rows: [{ id: 1, status: "cancelled", expired: false, school_id: 155 }],
				rowCount: 1,
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toEqual(new Error("400 ::: You are not able to clone the extract from another institution extract"));
});

test(`Success when user create a extract from uploaded asset`, async () => {
	const params = getGoodParams();
	params.asset_user_upload_oid = `8223b713aa71415463f183856681f9ab6033`;
	mockAssetDetails = { id: 1, page_count: 100, copyable_page_count: 100, title: "test" };
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM asset_user_upload ") !== -1) {
			return {
				rows: [{ id: 1, pages: [2, 4, 8], school_id: 153 }],
				rowCount: 1,
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toBe(null);
	expect(ctx.body.extract.oid.length).toBe(36);
	expect(ctx.body.urls).toBe(null);
});

test(`Error when user create a extract from uploaded asset`, async () => {
	const params = getGoodParams();
	params.asset_user_upload_oid = `8223b713aa71415463f183856681f9ab6033`;
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM asset_user_upload ") !== -1) {
			return {
				rows: [],
				rowCount: 0,
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Upload not found"));
});

test(`Error when user create a extract from uploaded asset with different pages`, async () => {
	const params = getGoodParams();
	params.asset_user_upload_oid = `8223b713aa71415463f183856681f9ab6033`;
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM asset_user_upload ") !== -1) {
			return {
				rows: [{ id: 1, pages: [2, 4, 8, 9], school_id: 153 }],
				rowCount: 1,
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractCreate(params)).toEqual(new Error("400 ::: Please select the same pages to create a copy."));
});
