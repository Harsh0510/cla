const courseCreateRaw = require("../../core/public/course-create");

let ctx;

jest.mock("#tvf-util", () => {
	const tvfUtil = {
		generateObjectIdentifier: async () => "abc123",
	};

	return tvfUtil;
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
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function courseCreate(data) {
	let err = null;
	try {
		ctx.body = await courseCreateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		title: "Course Title",
		identifier: "CRS1",
		year_group: "Y1",
	};
}

test(`Error when not logged in`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => reject(new Error("failed")));
	expect(await courseCreate(params, ctx)).toEqual(new Error("failed"));
});

test(`Error when course title is an empty string`, async () => {
	let params = getParams();
	params.title = "";
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	expect(await courseCreate(params, ctx)).toEqual(new Error("400 ::: Course Name not provided"));
});

test(`Error when course identifier is an empty string`, async () => {
	const params = getParams();
	params.identifier = "";
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	expect(await courseCreate(params, ctx)).toEqual(new Error("400 ::: Course Identifier not provided"));
});

test(`Error when course year_group is an empty string`, async () => {
	const params = getParams();
	params.year_group = "";
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	expect(await courseCreate(params, ctx)).toEqual(new Error("400 ::: Year Group not provided"));
});

test(`Error when the endpoint is accessed by a non school admin`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "teacher" }));
	expect(await courseCreate(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Return the oid and created true if a course is successfully created`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 1, rows: [{ oid: "abc123" }] }));
	expect(await courseCreate(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			oid: "abc123",
			created: true,
		},
	});
});

test(`Return the oid and created false if a course is not successfully created`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 0 }));
	expect(await courseCreate(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			oid: null,
			created: false,
		},
	});
});

test(`Return with throw exception error 'Unknown Error [1]' occurs`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => reject(new Error("failed")));
	expect(await courseCreate(params, ctx)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test(`Return with throw exception error 'You cannot create an identical course, please ensure that your course is unique.' occurs`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => reject(new Error(" violates unique constraint ")));
	expect(await courseCreate(params, ctx)).toEqual(
		new Error("400 ::: You cannot create an identical course, please ensure that your course is unique.")
	);
});
