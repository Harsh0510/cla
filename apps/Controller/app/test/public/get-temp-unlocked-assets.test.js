const getTempUnlockedAssetsRaw = require("../../core/public/get-temp-unlocked-assets");
const Context = require("../common/Context");

let ctx, mockResult, mockUserSessionData;
/**
 * Reset function - called before each test.
 */
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
	mockResult = {
		rows: [
			{
				expiration_date: "2019-06-03T04:50:23.495Z",
				pdf_isbn13: "9780008144678",
				title: "Test title 2",
			},
		],
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function getGoodAmmDbQuery(query, values) {
	const queryText = query.replace(/\s+/g, " ");
	if (queryText.indexOf("SELECT asset_school_info.expiration_date") !== -1) {
		return mockResult;
	}
}
async function getTempUnlockedAssets(data) {
	let err = null;
	try {
		ctx.body = await getTempUnlockedAssetsRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		pdf_isbn13: "9780008144678",
	};
}

test(`Success`, async () => {
	const params = getGoodParams();
	expect(await getTempUnlockedAssets(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: mockResult.rows });
});

test(`Success when pdf_isbn not provided`, async () => {
	const params = {};
	expect(await getTempUnlockedAssets(params)).toEqual(null);
	expect(ctx.body).toEqual({ result: mockResult.rows });
});

test(`Error when invalid ibn provided`, async () => {
	const params = getGoodParams();
	params.pdf_isbn13 = "1245";
	expect(await getTempUnlockedAssets(params)).toEqual(new Error("400 ::: ISBN isn't valid"));
	expect(ctx.body).toEqual(null);
});
