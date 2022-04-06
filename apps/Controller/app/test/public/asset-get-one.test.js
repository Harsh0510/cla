const assetGetOneRaw = require("../../core/public/asset-get-one.js");

let ctx;
var mockSuccessFlag = true;

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
		allowed_extract_ratio: 0.05,
	};
}

async function getGoodAmmDbQuery(query, values) {
	return {
		result: {
			id: 970,
			title: "english",
			sub_title: null,
			description: "description",
			page_count: 172,
			table_of_contents: null,
			edition: 1,
			publication_date: "2018-12-20T00:00:00.000Z",
			subject_codes: ["C"],
			subject_names: ["Language"],
			publisher: "OUP Oxford",
			authors: [
				{
					lastName: "Clayton",
					firstName: "Dan",
				},
			],
			temp_unlock_opt_in: false,
		},
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockSuccessFlag = true;
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
		async getSessionData() {
			return getGoodSessionData();
		},
		async appDbQuery(a, b) {
			return await getGoodAmmDbQuery(a, b);
		},
		responseStatus: 200,
	};
}

/** mock for isbn */
jest.mock("isbn", () => ({
	ISBN: {
		parse(a) {
			let p;
			if (a === "9876543210321") {
				p = {
					asIsbn13() {
						return a;
					},
					isValid() {
						return true;
					},
				};
			} else {
				p = {
					isValid() {
						return false;
					},
				};
			}
			return p;
		},
	},
}));

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function assetGetOne(data) {
	let err = null;
	try {
		ctx.body = await assetGetOneRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		isbn13: "9781910504734",
	};
}

test(`Error when no ISBN13 provided`, async () => {
	const params = getParams();
	delete params.isbn13;
	expect(await assetGetOne(params, ctx)).toEqual(new Error("400 ::: ISBN not provided"));
});

test(`Successfully returns result when logged in as teacher`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = async (_) => null;
	ctx.getSessionData = async (_) => ({ school_id: 5, user_role: "teacher" });
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [{ foo: "bar", is_unlocked: false }] }));
	expect(await assetGetOne(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			foo: "bar",
			is_unlocked: false,
		},
		is_unlocked: false,
	});
});

test(`School_id is 0 when session data is not extis`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = async (_) => null;
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [{ foo: "bar" }] }));
	expect(await assetGetOne(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			foo: "bar",
		},
		is_unlocked: false,
	});
});

test(`Successfully returns result when logged in as CLA admin`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "cla-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [{ foo: "bar" }] }));
	expect(await assetGetOne(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: {
			foo: "bar",
		},
		is_unlocked: false,
	});
});

test(`Successfully returns NULL result when no asset found`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "cla-admin" }));
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [] }));
	expect(await assetGetOne(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: null,
	});
});

test(`Successfully returns result with FAKE Sas Token`, async () => {
	mockSuccessFlag = true;
	const params = {
		isbn13: "9781910504734",
		fetch_sas_token: "sas-token",
	};
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "cla-admin" }));
	ctx.getClientIp = (_) => new Promise((resolve, reject) => resolve());
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [{ foo: "bar", is_unlocked: false }] }));
	expect(await assetGetOne(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: { foo: "bar", is_unlocked: false },
		is_unlocked: false,
		sas_token: "sas token",
	});
});

test(`Successfully returns result with Real Sas Token`, async () => {
	jest.resetModules();
	jest.mock(`../../core/admin/azure/azureBlobService`, () => {
		return {
			generateSasToken: () => {
				return {
					token: "real-sas-token",
				};
			},
		};
	});
	const assetGetOneRaw = require("../../core/public/asset-get-one.js");
	mockSuccessFlag = true;
	const params = {
		isbn13: "9781910504734",
		fetch_sas_token: "sas-token",
	};
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "cla-admin" }));
	ctx.getClientIp = (_) => new Promise((resolve, reject) => resolve());
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [{ foo: "bar", is_unlocked: false }] }));
	let err = null;
	try {
		ctx.body = await assetGetOneRaw(params, ctx);
	} catch (e) {
		err = e;
	}
	expect(err).toBeNull();
	expect(ctx.body).toEqual({
		result: { foo: "bar", is_unlocked: false },
		is_unlocked: false,
		sas_token: "real-sas-token",
	});
});

test(`Successfully returns result with User Favorite and UnFavorite asset When user is LoggedIn then `, async () => {
	mockSuccessFlag = true;
	const params = {
		isbn13: "9781910504734",
		fetch_sas_token: "sas-token",
	};
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "cla-admin", user_id: 225 }));
	ctx.getClientIp = (_) => new Promise((resolve, reject) => resolve());
	ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [{ foo: "bar", is_unlocked: true, is_favorite: true }] }));
	expect(await assetGetOne(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: { foo: "bar", is_unlocked: true, is_favorite: true },
		is_unlocked: false,
		sas_token: "sas token",
	});
});
