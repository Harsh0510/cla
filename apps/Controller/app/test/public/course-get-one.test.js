const courseGetOneRaw = require("../../core/public/course-get-one");

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

async function courseGetOne(data) {
	let err = null;
	try {
		ctx.body = await courseGetOneRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		oid: "abc123",
	};
}

test(`Error when not logged in`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => reject(new Error("failed")));
	expect(await courseGetOne(params, ctx)).toEqual(new Error("failed"));
});

test(`Successfully returns result when the oid matches a course`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [{ oid: "abc123" }] }));
	expect(await courseGetOne(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			oid: "abc123",
		},
	});
});

test(`Successfully returns NULL result when no courses are found`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [] }));
	expect(await courseGetOne(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: null,
	});
});

test(`Successfully returns NULL result when no courses are found`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => reject("failed"));

	expect(await courseGetOne(params, ctx)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test(`Successfully returns NULL result when no school id is provided`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => reject("failed"));

	expect(await courseGetOne(params, ctx)).toEqual(new Error("400 ::: Unknown Error [1]"));
});
