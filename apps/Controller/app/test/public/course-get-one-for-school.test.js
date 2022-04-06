const courseGetOneForSchoolRaw = require("../../core/public/course-get-one-for-school");
const Context = require("../common/Context");

let ctx;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function courseGetOneForSchool(data) {
	let err = null;
	try {
		ctx.body = await courseGetOneForSchoolRaw(data, ctx);
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
	expect(await courseGetOneForSchool(params, ctx)).toEqual(new Error("failed"));
});

test(`Successfully returns result when a school id is provided and the school has courses`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 1, rows: [{ oid: "8223b713aa71415463f183856681f9ab6033" }] }));
	expect(await courseGetOneForSchool(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		courseOid: "8223b713aa71415463f183856681f9ab6033",
	});
});

test(`Successfully returns NULL when a school id is provided and the school has no courses`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ school_id: 5, user_role: "school-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rowCount: 0 }));
	expect(await courseGetOneForSchool(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		courseOid: null,
	});
});
