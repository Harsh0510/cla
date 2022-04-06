const getExtractLimitsRaw = require("../../core/public/get-extract-limits");

let mockGetExtractLimitPercentage, mockGetExtractPagesForCourse, mockGetExtractPagesForSchool;
jest.mock(`../../core/public/common/getExtractLimitPercentage`, () => {
	return function () {
		return mockGetExtractLimitPercentage;
	};
});

jest.mock("../../core/public/common/getSchoolIdFromExtract", () => {
	return function (ctx, extract_oid) {
		if (extract_oid) {
			return 1;
		} else {
			return null;
		}
	};
});

jest.mock(`../../common/getExtractPagesForCourse`, () => {
	return function () {
		return mockGetExtractPagesForCourse;
	};
});

jest.mock(`../../common/getExtractPagesForSchool`, () => {
	return function () {
		return mockGetExtractPagesForSchool;
	};
});

// jest.mock('#tvf-ensure', () => {
// 	const tvfEnsure = {
// 		validIdentifier: (ctx, value, name) =>  {
// 			if (!value) {
// 				throw new Error(`400 ::: ${name} not provided`);
// 			}
// 			if (typeof value !== "string") {
// 				throw new Error(`400 ::: ${name} invalid`);
// 			}
// 			if (value.length !== 36) {
// 				throw new Error(`400 ::: ${name} invalid`);
// 			}
// 			if (!value.match(/^[0-9a-f]+$/)) {
// 				throw new Error(`400 ::: ${name} is invalid`);
// 			}
// 		},
// 		validIsbn13: (ctx, value, name) => {
// 			if (!value) {
// 				throw new Error(`400 ::: ${name} not provided`);
// 			}
// 			if (typeof value !== "string") {
// 				throw new Error(`400 ::: ${name} invalid`);
// 			}
// 			if (value.length !== 13) {
// 				throw new Error(`400 ::: ${name} not valid`);
// 			}
// 			return true;
// 		}
// 	};
// 	return tvfEnsure;
// });

let ctx;

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
}

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(" FROM course ") !== -1) {
		return {
			rows: [{ id: 5 }],
		};
	}
	if (query.indexOf(" FROM asset ") !== -1) {
		return {
			rows: [{ id: 10, page_count: 10, copyable_page_count: 10 }],
		};
	}
	if (query.indexOf(" FROM extract_page ") !== -1) {
		return {
			rows: [{ page_number: 5 }, { page_number: 25 }, { page_number: 15 }],
		};
	}
	if (query.indexOf(" FROM extract_page_by_school ") !== -1) {
		return {
			rows: [{ page_number: 5 }, { page_number: 25 }, { page_number: 15 }],
		};
	}
	throw new Error("should not be here");
}

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
		responseStatus: 200,
	};
	mockGetExtractLimitPercentage = { class: 0.05, school: 0.2 };
	mockGetExtractPagesForCourse = [1, 2, 3];
	mockGetExtractPagesForSchool = [1, 2, 3];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function getExtractLimits(data) {
	let err = null;
	try {
		ctx.body = await getExtractLimitsRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		course_oid: "a".repeat(36),
		work_isbn13: "9781910504734",
		extract_oid: "11212121121212222222222",
	};
}

test(`Error when invalid course_oid is provided`, async () => {
	const params = getGoodParams();
	params.course_oid = 123;
	expect(await getExtractLimits(params)).toEqual(new Error("400 ::: Course invalid"));
});

test(`Error when invalid ISBN13 is provided`, async () => {
	const params = getGoodParams();
	delete params.work_isbn13;
	expect(await getExtractLimits(params)).toEqual(new Error("400 ::: ISBN not provided"));
});

test(`Error when requester is not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await getExtractLimits(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Error when course is not found`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf(" FROM course ") !== -1) {
			return {
				rows: null,
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await getExtractLimits(params)).toEqual(new Error("400 ::: Course not found"));
});

test(`Error when asset is not found`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf(" FROM asset ") !== -1) {
			return {
				rows: [],
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await getExtractLimits(params)).toEqual(new Error("400 ::: Asset not found"));
});

test(`Succeed when no previous extracts have been made`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf(" FROM extract_page ") !== -1) {
			return {
				rows: [],
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await getExtractLimits(params)).toBe(null);
	expect(ctx.body).toEqual({
		course: { extracted: [1, 2, 3], limit: 1 },
		school: { extracted: [1, 2, 3], limit: 2 },
	});
});

test(`Succeed when some previous extracts have been made`, async () => {
	const params = getGoodParams();
	expect(await getExtractLimits(params)).toBe(null);
	expect(ctx.body).toEqual({
		course: { extracted: [1, 2, 3], limit: 1 },
		school: { extracted: [1, 2, 3], limit: 2 },
	});
});

test(`Succeed when no previous extracts have been made and extract_oid is not passed`, async () => {
	const params = getGoodParams();
	delete params.extract_oid;
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf(" FROM extract_page ") !== -1) {
			return {
				rows: [],
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await getExtractLimits(params)).toBe(null);
	expect(ctx.body).toEqual({
		course: { extracted: [], limit: 1 },
		school: { extracted: [5, 25, 15], limit: 2 },
	});
});

test(`Succeed when some previous extracts have been made and extract_oid is not passed`, async () => {
	const params = getGoodParams();
	delete params.extract_oid;
	expect(await getExtractLimits(params)).toBe(null);
	expect(ctx.body).toEqual({
		course: { extracted: [5, 25, 15], limit: 1 },
		school: { extracted: [5, 25, 15], limit: 2 },
	});
});

test(`Returns only school limit when only work isbn is passed`, async () => {
	const params = {
		work_isbn13: "9781910504734",
	};
	expect(await getExtractLimits(params)).toBe(null);
	expect(ctx.body).toEqual({
		school: { extracted: [5, 25, 15], limit: 2 },
	});
});
