const forceAsyncTickRaw = require("../../core/admin/force-async-tick");

let ctx, asyncRunner;

function defaultGetUserRoleFunction(role) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(role);
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
		getUserRole: defaultGetUserRoleFunction("cla-admin"),
	};
	asyncRunner = {
		forceTick: () => {
			return true;
		},
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function forceAsyncTick(params, ctx, asyncRunner) {
	let err = null;
	try {
		ctx.body = await forceAsyncTickRaw(params, ctx, asyncRunner);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is not a cla-admin`, async () => {
	ctx.getUserRole = defaultGetUserRoleFunction("teacher");
	expect(await forceAsyncTick(null, ctx, asyncRunner)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Returns true if task is found`, async () => {
	expect(await forceAsyncTick(null, ctx, asyncRunner)).toBeNull();
	expect(ctx.body).toEqual({
		found_task: true,
	});
});
