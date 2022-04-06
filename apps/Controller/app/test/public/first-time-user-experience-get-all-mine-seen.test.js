const firTimeUserExegetAllMineSeenRaw = require("../../core/public/first-time-user-experience-get-all-mine-seen");
const context = require("../common/Context");
let mockResult;
/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
	mockResult = {
		rows: [
			{
				screen: "home",
				index: 4,
			},
			{
				screen: "search",
				index: 15,
			},
		],
	};
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT") !== -1) {
			return mockResult;
		}
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/** Common function */
async function firTimeUserExegetAllMineSeen(data) {
	let err = null;
	try {
		ctx.body = await firTimeUserExegetAllMineSeenRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {};
}

test(`Error when not login`, async () => {
	const params = getParams();
	ctx.sessionData = null;
	const res = await firTimeUserExegetAllMineSeen(params);
	expect(res).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Test when got result successfully`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_id: 942 }));

	const res = await firTimeUserExegetAllMineSeen(params);
	expect(res).toEqual(null);
	expect(ctx.body).toEqual({
		data: {
			home: 4,
			search: 15,
			notification: -1,
		},
	});
});

test(`Test when got notification index`, async () => {
	mockResult = {
		rows: [
			{
				screen: "notification",
				index: 1,
			},
		],
	};
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_id: 942 }));

	const res = await firTimeUserExegetAllMineSeen(params);
	expect(res).toEqual(null);
	expect(ctx.body).toEqual({
		data: {
			notification: 1,
		},
	});
});

test(`Test when got 0 rows in return`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_id: 942 }));
	mockResult = { rows: [] };
	const res = await firTimeUserExegetAllMineSeen(params);
	expect(res).toEqual(null);
	expect(ctx.body).toEqual({
		data: {
			notification: -1,
		},
	});
});
