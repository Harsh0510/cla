const getCountriesRaw = require("../../core/auth/get-countries");

let ctx, data;

function defaultAppDbQuery(query, values) {
	query = query.trim();
	return new Promise((resolve, reject) => {
		resolve({ rows: [0, 1], rowCount: 2 });
	});
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
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function getCountries(data) {
	let err = null;
	try {
		ctx.body = await getCountriesRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Return data when request is well formed`, async () => {
	expect(await getCountries(data)).toBeNull();
	expect(ctx.body).toEqual({ result: [0, 1] });
});

test(`Error when query throws an error`, async () => {
	ctx.appDbQuery = () => {
		throw new Error();
	};

	expect(await getCountries(data)).toEqual(new Error("400 ::: Unknown Error"));
});
