const getMyDetailsRaw = require("../../core/auth/get-my-details");

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

async function getMyDetails(data) {
	let err = null;
	try {
		ctx.body = await getMyDetailsRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Return NULL when no session data found`, async () => {
	ctx.getSessionData = async (_) => null;
	expect(await getMyDetails()).toBeNull();
	expect(ctx.body).toEqual({
		data: null,
	});
});

test(`Return NULL when no user ID found`, async () => {
	ctx.getSessionData = async (_) => ({});
	expect(await getMyDetails()).toBeNull();
	expect(ctx.body).toEqual({
		data: null,
	});
});

test(`Return NULL when no user matching provided ID found`, async () => {
	ctx.getSessionData = async (_) => ({ user_id: 5 });
	ctx.appDbQuery = async (_) => ({ rows: [] });
	expect(await getMyDetails()).toBeNull();
	expect(ctx.body).toEqual({
		data: undefined,
	});
});

test(`Return user data when user is found`, async () => {
	ctx.getSessionData = async (_) => ({ user_id: 5 });
	ctx.appDbQuery = async (_) => ({
		rows: [
			{
				first_name: "a",
				last_name: "b",
				role: "c",
				school: "d",
			},
		],
	});
	expect(await getMyDetails()).toBeNull();
	expect(ctx.body).toEqual({
		data: {
			first_name: "a",
			last_name: "b",
			role: "c",
			school: "d",
		},
	});
});
