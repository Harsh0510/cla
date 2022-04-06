const courseEditRaw = require("../../core/public/course-edit");

let ctx;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

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
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function courseEdit(data) {
	let err = null;
	try {
		ctx.body = await courseEditRaw(data, ctx);
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
	expect(await courseEdit(params, ctx)).toEqual(new Error("failed"));
});

test(`Error when course title is an empty string`, async () => {
	let params = getParams();
	params.title = "";
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	expect(await courseEdit(params, ctx)).toEqual(new Error("400 ::: Course Title not provided"));
});

test(`Error when course identifier is an empty string`, async () => {
	const params = getParams();
	params.identifier = "";
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	expect(await courseEdit(params, ctx)).toEqual(new Error("400 ::: Course Identifier not provided"));
});

test(`Error when course year_group is an empty string`, async () => {
	const params = getParams();
	params.year_group = "";
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	expect(await courseEdit(params, ctx)).toEqual(new Error("400 ::: Year Group not provided"));
});

test(`Error when the endpoint is accessed by a non school admin`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "teacher" }));
	expect(await courseEdit(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Return the oid and edited true if a course is successfully edited`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 1 }));
	expect(await courseEdit(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			oid: "abc123",
			edited: true,
		},
	});
});

test(`Return the oid and edited false if a course is not successfully edited`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 0 }));
	expect(await courseEdit(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			oid: "abc123",
			edited: false,
		},
	});
});

test(`Return with throw exception error 'Unknown Error [1]' occurs`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => reject("failed"));
	expect(await courseEdit(params, ctx)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (query, binds) => {
		query = query.trim().replace(/[\s\t\n\r]+/g, " ");
		if (query.indexOf("UPDATE course SET") !== -1) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return new Promise((resolve, reject) => resolve({ rowCount: 1 }));
		}
	};
	expect(await courseEdit(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			oid: "abc123",
			edited: true,
		},
	});
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
