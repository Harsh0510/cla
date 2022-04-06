const OLD_ENV = process.env;
const canCopy = require("../../../core/auth/common/canCopy");
const ensureCanCopyRaw = canCopy.ensureCanCopy;
const context = require("../../common/Context");
let ctx, mockCanCopy;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
	mockCanCopy = true;
	ctx.getSessionData = () => {
		return { user_id: 100 };
	};
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("cla_user.status") !== -1) {
			if (mockCanCopy) {
				return { rowCount: 1, rows: [{ can_copy: true }] };
			} else {
				return { rowCount: 0, rows: [] };
			}
		}
	};
}
/**
 * Clear everything before and after each test
 */
beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	resetAll();
});

afterEach(() => {
	process.env = OLD_ENV; // restore old env
	resetAll();
});

async function ensureCanCopy() {
	let err = null;
	try {
		ctx.body = await ensureCanCopyRaw(ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Get sql query for check user can Copy status`, async () => {
	const sqlString = canCopy.canCopySql();
	expect(typeof sqlString === "string").toBe(true);
	expect(sqlString).not.toBeNull();
});

test(`Return true when user can copy the asset`, async () => {
	mockCanCopy = true;
	ctx.getSessionData = (_) => {
		return new Promise((resolve, reject) => {
			resolve({ user_id: 100 });
		});
	};
	const result = await ensureCanCopy();
	expect(result).toBeNull();
	expect(ctx.body).toBe(undefined);
});

test(`Return false when user can copy the asset`, async () => {
	mockCanCopy = false;
	ctx.getSessionData = (_) => {
		return new Promise((resolve, reject) => {
			resolve({ user_id: 100 });
		});
	};
	const result = await ensureCanCopy();
	expect(result).toEqual(new Error("400 ::: _ERROR_ :: cannot copy"));
	expect(ctx.body).toBe(null);
});

test(`when user in trial period`, async () => {
	process.env.CLA_TRIAL_PERIOD_HOURS = 10;
	const canCopy = require("../../../core/auth/common/canCopy");
	const sqlString = canCopy.canCopySql();
	expect(typeof sqlString === "string").toBe(true);
	expect(sqlString).not.toBeNull();
});

test(`when user in trial period and houres greater then 50000`, async () => {
	process.env.CLA_TRIAL_PERIOD_HOURS = 60000;
	const canCopy = require("../../../core/auth/common/canCopy");
	const sqlString = canCopy.canCopySql();
	expect(typeof sqlString === "string").toBe(true);
	expect(sqlString).not.toBeNull();
});

test(`when user in trial period and houres less then 0`, async () => {
	process.env.CLA_TRIAL_PERIOD_HOURS = -1;
	const canCopy = require("../../../core/auth/common/canCopy");
	const sqlString = canCopy.canCopySql();
	expect(typeof sqlString === "string").toBe(true);
	expect(sqlString).not.toBeNull();
});
