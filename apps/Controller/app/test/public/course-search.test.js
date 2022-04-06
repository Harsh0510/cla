const withAssert = require("#tvf-ensure");
const courseSearchRaw = require("../../core/public/course-search");
const Context = require("../common/Context");

let ctx, mockCourseResultFirst, mockCourseResultSecond, mockCalledFirstQuery, mockCalledSecondQuery, mockUserSessionData, mockSchoolIdResult;

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`course.keywords @@`) !== -1) {
		mockCalledFirstQuery = true;
		return mockCourseResultFirst;
	}
	if (query.indexOf(`course.title_lower LIKE`) !== -1) {
		mockCalledSecondQuery = true;
		return mockCourseResultSecond;
	}
	if (query.indexOf(`SELECT course.oid AS id, course.title AS name FROM course WHERE (course.archive_date`) !== -1) {
		return mockCourseResultFirst;
	}
	if (query.indexOf(`SELECT school_id FROM extract`) !== -1) {
		return mockSchoolIdResult;
	}
	return;
}

function defaultGetUserRoleFunctor(role) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(role);
		});
	};
}

function resetAll() {
	mockUserSessionData = {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
	ctx = new Context();
	ctx.getSessionData = async (_) => {
		return mockUserSessionData;
	};

	ctx.getUserRole = async (_) => {
		return mockUserSessionData.user_role;
	};

	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};

	data = {
		oid: "1cfdfc7541b51b7d61ff70cced0594991d4e",
		limit: 3,
	};

	ctx.body = null;
	mockCourseResultFirst = {
		rows: [
			{ id: "fcc48a1cee7950d7abab6c967ec45595b2b2", name: "Testing Class 1" },
			{ id: "941e23e9b557f1fe738a3f2306b572d42c29", name: "Testing Class 2" },
		],
		rowCount: 2,
	};
	mockCourseResultSecond = {
		rows: [
			{ id: "af18a1730a9ee221e8931e635b0c242695f3", name: "Test 1" },
			{ id: "7f8833d51c7e1a2e0bba4c0da8c1dea6e883", name: "Test 2" },
		],
		rowCount: 2,
	};
	mockSchoolIdResult = {
		rows: [{ school_id: "123" }],
		rowCount: 1,
	};
	mockCalledFirstQuery = false;
	mockCalledSecondQuery = false;
}

async function courseSearch(data) {
	let err = null;
	try {
		ctx.body = await courseSearchRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Error when empty query is passed `, async () => {
	data.query = {};
	expect(await courseSearch(data)).toEqual(new Error("400 ::: Query invalid"));
	expect(ctx.body).toEqual(null);
});

test(`Error when invalid querry is passed`, async () => {
	mockCourseResultFirst = {
		rows: [],
		rowCount: 0,
	};
	data.query = {};
	expect(await courseSearch(data)).toEqual(new Error("400 ::: Query invalid"));
	expect(ctx.body).toEqual(null);
});

test(`Error when pass invalid limit `, async () => {
	data.limit = 0;
	expect(await courseSearch(data)).toEqual(new Error("400 ::: limit must be positive"));
	expect(ctx.body).toEqual(null);
});

test(`Error when pass invalid oid `, async () => {
	data.oid = 123;
	expect(await courseSearch(data)).toEqual(new Error("400 ::: Identifier invalid"));
	expect(ctx.body).toEqual(null);
});

test(`Error when pass null oid `, async () => {
	data.oid = null;
	expect(await courseSearch(data)).toEqual(new Error("400 ::: Identifier not provided"));
	expect(ctx.body).toEqual(null);
});

test(`Error when no parameters is passed `, async () => {
	data = {};
	expect(await courseSearch(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: mockCourseResultFirst.rows,
	});
});

test(`when pass valid query `, async () => {
	data.query = "test";
	expect(await courseSearch(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: mockCourseResultFirst.rows,
	});
});

test(`User gets the result based on title when enter only two characters`, async () => {
	mockCourseResultFirst = {
		rows: [],
		rowCount: 0,
	};
	data.query = "Te";
	expect(await courseSearch(data)).toEqual(null);
	expect(ctx.body).toEqual({ result: mockCourseResultSecond.rows });
});

test(`User gets the result based on extractOid when user is cla admin`, async () => {
	mockUserSessionData.user_role = "cla-admin";
	data.query = "Te";
	data.extractOid = "10519009a308eb4af2d3402b5d68c65a6399";
	expect(await courseSearch(data)).toEqual(null);
	expect(ctx.body).toEqual({ result: mockCourseResultFirst.rows });
});
