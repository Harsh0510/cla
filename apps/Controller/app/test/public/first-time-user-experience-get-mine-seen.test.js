const firstTimeUserExperienceGetMineSeenRaw = require("../../core/public/first-time-user-experience-get-mine-seen");
const context = require("../common/Context");

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/**Common function */
async function firstTimeUserExperienceGetMineSeen(data) {
	let err = null;
	try {
		ctx.body = await firstTimeUserExperienceGetMineSeenRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		screen: "unlock",
	};
}

test(`Error when not login`, async () => {
	const params = getGoodParams();
	ctx.sessionData = null;
	expect(await firstTimeUserExperienceGetMineSeen(params)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when screen invalid`, async () => {
	const params = getGoodParams();
	params.screen = 1234;
	expect(await firstTimeUserExperienceGetMineSeen(params)).toEqual(new Error("400 ::: Screen invalid"));
});

test(`Error when screen not pass`, async () => {
	const params = getGoodParams();
	delete params.screen;
	expect(await firstTimeUserExperienceGetMineSeen(params)).toEqual(new Error("400 ::: Screen not provided"));
});

test(`Unknown Error`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT") !== -1) {
			throw new Error("400 ::: Unknown Error");
		}
	};
	expect(await firstTimeUserExperienceGetMineSeen(params)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test(`Success`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT") !== -1) {
			return { rows: [{ index: 2 }] };
		}
	};
	expect(await firstTimeUserExperienceGetMineSeen(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: 2 });
});

test(`Success and return -1 if no data`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT") !== -1) {
			return { rows: [] };
		}
	};
	expect(await firstTimeUserExperienceGetMineSeen(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: -1 });
});
