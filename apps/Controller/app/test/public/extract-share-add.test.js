const extractShareAddRaw = require("../../core/public/extract-share-add");

let ctx;

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
		allowed_extract_ratio: 0.05,
	};
}

function defaultGetUserRoleFunctor(role) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(role);
		});
	};
}

async function getGoodAmmDbQuery(query, values) {
	const year = new Date().getFullYear() + 1;
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(" FROM extract ") !== -1) {
		return {
			rows: [{ id: 123, date_expired: year + "-07-31 23:59:59.999", enable_extract_share_access_code: false }],
		};
	}
	if (query.indexOf("INSERT INTO extract_share ") !== -1) {
		return {
			rows: [],
		};
	}
	if (query.indexOf("AS can_copy FROM cla_user") !== -1) {
		return {
			rows: [
				{
					can_copy: true,
				},
			],
			rowCount: 1,
		};
	}
	throw new Error("should not be here");
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
		async ensureLoggedIn() {
			return true;
		},
		async getSessionData() {
			return getGoodSessionData();
		},
		async appDbQuery(a, b) {
			return await getGoodAmmDbQuery(a, b);
		},
		getUserRole: defaultGetUserRoleFunctor("cla-admin"),
		responseStatus: 200,
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractShareAdd(data) {
	let err = null;
	try {
		ctx.body = await extractShareAddRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		extract_oid: "a".repeat(36),
		title: "extract_title",
	};
}

test(`Error when invalid extract_oid is provided`, async () => {
	const params = getGoodParams();
	delete params.extract_oid;
	expect(await extractShareAdd(params)).toEqual(new Error("400 ::: Extract not provided"));
});

test(`Error when requester is not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractShareAdd(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Error when requester is not associated with a school`, async () => {
	const params = getGoodParams();
	ctx.getUserRole = defaultGetUserRoleFunctor("teacher");
	ctx.getSessionData = async (_) => {
		const s = getGoodSessionData();
		delete s.school_id;
		return s;
	};
	expect(await extractShareAdd(params)).toEqual(new Error("401 ::: You must be associated with a school to create an extract"));
});

test(`Error when extract is not found`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM extract ") !== -1) {
			return {
				rows: [],
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractShareAdd(params)).toEqual(new Error("400 ::: Extract not found"));
});

test(`Return with throw exception error 'Unknown Error' occurs`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("INSERT INTO extract_share ") !== -1) {
			throw {
				message: "Unknown Error",
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractShareAdd(params)).toEqual(new Error("400 ::: Unknown Error"));
});

test(`Success!`, async () => {
	const params = getGoodParams();
	ctx.getUserRole = defaultGetUserRoleFunctor("teacher");
	expect(await extractShareAdd(params)).toBe(null);
	expect(ctx.body.extract_share_oid.length).toBe(36);
});

test(`Gerate the access code`, async () => {
	const params = getGoodParams();
	ctx.appDbQuery = async (query, values) => {
		if (query.replace(/\s+/g, " ").indexOf("FROM extract ") !== -1) {
			const year = new Date().getFullYear() + 1;
			return {
				rows: [{ id: 123, date_expired: year + "-07-31 23:59:59.999", enable_extract_share_access_code: true }],
			};
		}
		return await getGoodAmmDbQuery(query, values);
	};
	expect(await extractShareAdd(params)).toBe(null);
	expect(ctx.body.extract_share_oid.length).toBe(36);
	expect(ctx.body.extract_share_title).not.toBeNull();
});
