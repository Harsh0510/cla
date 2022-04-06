const courseGetAllForSchoolRaw = require("../../core/public/course-get-all-for-school");

let ctx, mockAlldetails, mockGetSchoolIdFromExtract;

jest.mock(`../../core/public/common/getSchoolIdFromExtract`, () => {
	return function () {
		return mockGetSchoolIdFromExtract;
	};
});

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
		responseStatus: 200,
	};
	mockAlldetails = [
		{
			title: "test",
			year_group: "y12",
			oid: "11212121121212222222222",
			number_of_students: 100,
			exam_board: "EDA",
		},
		{
			title: "test1",
			year_group: "y10",
			oid: "11212121121212222222222",
			number_of_students: 10,
			exam_board: "ICE",
		},
	];
	mockGetSchoolIdFromExtract = 1;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function courseGetAllForSchool(data) {
	let err = null;
	try {
		ctx.body = await courseGetAllForSchoolRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {};
}

test(`Error when not logged in`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => reject(new Error("failed")));
	expect(await courseGetAllForSchool(params, ctx)).toEqual(new Error("failed"));
});

test(`Successfully returns result when a school id is provided and the school has courses`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 1, rows: [] }));
	expect(await courseGetAllForSchool(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: [],
	});
});

test(`Successfully returns NULL when a school id is provided and the school has no courses`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 0 }));
	expect(await courseGetAllForSchool(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: null,
	});
});

test(`Return with throw exception error 'Unknown Error [1]' occurs`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => reject("failed"));
	expect(await courseGetAllForSchool(params, ctx)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test(`Return result with include extra details`, async () => {
	const params = getParams();
	params.include_extra_data = true;
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 2, rows: mockAlldetails }));
	const result = await courseGetAllForSchool(params, ctx);
	expect(result).toEqual(null);
	expect(ctx.body).toEqual({ result: mockAlldetails });
});

test(`Return result with oid`, async () => {
	const params = getParams();
	params.include_extra_data = true;
	params.oid = "a".repeat(36);
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 1, rows: [mockAlldetails[0]] }));
	const result = await courseGetAllForSchool(params, ctx);
	expect(result).toEqual(null);
	const resultData = ctx.body;
	expect(resultData.result.length).toEqual(1);
	expect(ctx.body).toEqual({ result: [mockAlldetails[0]] });
});
