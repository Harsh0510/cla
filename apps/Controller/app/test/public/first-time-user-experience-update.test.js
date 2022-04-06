const firstTimeUserExperienceUpdateRaw = require("../../core/public/first-time-user-experience-update");
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
async function firstTimeUserExperienceUpdate(data) {
	let err = null;
	try {
		ctx.body = await firstTimeUserExperienceUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		screen: "unlock",
		index: 2,
	};
}

test(`Error when not login`, async () => {
	const params = getGoodParams();
	ctx.sessionData = null;
	expect(await firstTimeUserExperienceUpdate(params)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when screen invalid`, async () => {
	const params = getGoodParams();
	params.screen = 1234;
	expect(await firstTimeUserExperienceUpdate(params)).toEqual(new Error("400 ::: Screen invalid"));
});

test(`Error when screen not pass`, async () => {
	const params = getGoodParams();
	delete params.screen;
	expect(await firstTimeUserExperienceUpdate(params)).toEqual(new Error("400 ::: Screen not provided"));
});

test(`Unknown Error`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("INSERT") !== -1) {
			throw new Error("500 ::: An unexpected error has occurred");
		}
	};
	expect(await firstTimeUserExperienceUpdate(params)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test(`Success`, async () => {
	const params = getGoodParams();

	expect(await firstTimeUserExperienceUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});
