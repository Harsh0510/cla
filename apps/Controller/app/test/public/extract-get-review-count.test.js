const getExtractViewCountRaw = require("../../core/public/extract-get-review-count");
const Context = require("../common/Context");

let ctx, mockUserSessionData, result;
function resetAll() {
	mockUserSessionData = {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
	ctx = new Context();
	ctx.getSessionData = async (_) => {
		return mockUserSessionData;
	};

	ctx.getUserRole = async (_) => {
		return mockUserSessionData.user_role;
	};

	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};
	result = { count: 8 };
}

beforeEach(resetAll);
afterEach(resetAll);

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`SELECT COUNT`) !== -1) {
		return { rows: [{ count: 1 }] };
	}
	return;
}

async function getExtractViewCount() {
	let err = null;
	try {
		ctx.body = await getExtractViewCountRaw(null, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Success`, async () => {
	expect(await getExtractViewCount()).toEqual(null);
	expect(ctx.body).not.toBeNull();
});

test(`Error when user is not logged in`, async () => {
	mockUserSessionData = [];
	expect(await getExtractViewCount()).toEqual(new Error("401 ::: Unauthorized"));
});
