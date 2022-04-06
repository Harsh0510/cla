const checkActivationTokenStatusRaw = require("../../../core/auth/common/checkActivationTokenStatus");
const Context = require("../../common/Context");

let ctx, mockResult;

function resetAll() {
	ctx = new Context();
	ctx.appDbQuery = async (query, data) => {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.includes("FROM cla_user")) {
			return mockResult;
		}
		throw "Should never come here";
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function checkActivationTokenStatus(dbQuerier, token) {
	let err = null;
	try {
		ctx.body = await checkActivationTokenStatusRaw(dbQuerier, token);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`test result when query returns 0 rows`, async () => {
	mockResult = {};
	expect(await checkActivationTokenStatus(ctx.appDbQuery, "token")).toBeNull();
	expect(ctx.body).toEqual({
		expired: false,
		exists: false,
		okay: false,
	});
});

test(`test result when query returns result`, async () => {
	mockResult = {
		rows: [
			{
				is_token_expired: false,
				token_exists: true,
			},
		],
	};
	expect(await checkActivationTokenStatus(ctx.appDbQuery, "token")).toBeNull();
	expect(ctx.body).toEqual({
		expired: false,
		exists: true,
		okay: true,
	});
});
