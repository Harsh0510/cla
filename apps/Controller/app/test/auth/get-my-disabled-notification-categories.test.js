const getMyDisabledNotificationCategoriesRaw = require("../../core/auth/get-my-disabled-notification-categories");
const Context = require("../common/Context");

let ctx,
	data,
	result = { items: [1] };

function resetAll() {
	ctx = new Context();
}

/** Clear everything before and after each test */
beforeEach(resetAll);
afterEach(resetAll);

async function getMyDisabledNotificationCategories(data) {
	let err = null;
	try {
		ctx.body = await getMyDisabledNotificationCategoriesRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

/** default params for create user */
function getParams() {
	return {};
}

test(`Error Unauthorized`, async () => {
	ctx.sessionData = null;
	const params = getParams();
	expect(await getMyDisabledNotificationCategories(params, ctx)).toEqual(new Error(`401 ::: Unauthorized`));
});

test(`Get disable notification categories id`, async () => {
	const params = getParams();
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("SELECT") !== -1) {
			return { rows: [{ id: 1 }] };
		}
		throw new Error("should never get here");
	};
	expect(await getMyDisabledNotificationCategories(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual(result);
});
