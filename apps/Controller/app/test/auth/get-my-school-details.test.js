const getMySchoolDetailsRaw = require("../../core/auth/get-my-school-details");

jest.mock("../../common/wonde/schoolUpdatableFields", () => {
	return ["a", "b", "c"];
});

let ctx, data;

function defaultAppDbQuery(query, values) {
	query = query.trim();
	return new Promise((resolve, reject) => {
		resolve({ rows: [0, 1], rowCount: 2 });
	});
}

function defaultGetUserRoleFunctor(role) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(role);
		});
	};
}

function defaultGetSessionDataFunctor(data) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(data);
		});
	};
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
		responseStatus: 200,
		body: null,
		appDbQuery: defaultAppDbQuery,
		getUserRole: defaultGetUserRoleFunctor("cla-admin"),
		getSessionData: defaultGetSessionDataFunctor({ school_id: 0 }),
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function getMySchoolDetails(data) {
	let err = null;
	try {
		ctx.body = await getMySchoolDetailsRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is not a school or cla admin`, async () => {
	ctx.getUserRole = defaultGetUserRoleFunctor("teacher");
	expect(await getMySchoolDetails(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Return data when request is well formed`, async () => {
	expect(await getMySchoolDetails(data)).toBeNull();
	expect(ctx.body).toEqual({ blocked_fields: ["a", "b", "c"], result: [0, 1] });
});
