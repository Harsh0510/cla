const courseDeleteRaw = require("../../core/public/course-delete");

let ctx;

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

async function courseDelete(data) {
	let err = null;
	try {
		ctx.body = await courseDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		oid: "abc123",
		title: "Course Title",
		identifier: "CRS1",
		year_group: "Y1",
	};
}

test(`Error when not logged in`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => reject(new Error("failed")));
	expect(await courseDelete(params, ctx)).toEqual(new Error("failed"));
});

test(`Error when the endpoint is accessed by a non school admin`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "teacher" }));
	expect(await courseDelete(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Return the oid and deleted true if a course is successfully deleted`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 1 }));
	expect(await courseDelete(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			oid: "abc123",
			deleted: true,
		},
	});
});

test(`Return the oid and deleted false if a course is not successfully deleted`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 0 }));
	expect(await courseDelete(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			oid: "abc123",
			deleted: false,
		},
	});
});

test(`Return with throw exception error 'Unknown Error [1]' occurs`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => reject("failed"));
	expect(await courseDelete(params, ctx)).toEqual(new Error("400 ::: Unknown Error [1]"));
});
