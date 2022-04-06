const getNotificationCategoriesRaw = require("../../core/auth/get-notification-categories");
const Context = require("../common/Context");

let ctx, data;

const mockResult = {
	items: [
		{ id: 1, description: "Receive notifications about users awaiting approval" },
		{ id: 2, description: "Receive notifications about books I tried to unlock and are now available" },
		{ id: 3, description: "Receive notifications about new classes being added" },
	],
};

function resetAll() {
	ctx = new Context();
}

/** Clear everything before and after each test */
beforeEach(resetAll);
afterEach(resetAll);

async function getNotificationCategories(data) {
	let err = null;
	try {
		ctx.body = await getNotificationCategoriesRaw(data, ctx);
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
	expect(await getNotificationCategories(params, ctx)).toEqual(new Error(`401 ::: Unauthorized`));
});

test(`Get notification categories`, async () => {
	const params = getParams();
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("SELECT") !== -1) {
			return { rows: mockResult.items };
		}
		throw new Error("should never get here");
	};
	expect(await getNotificationCategories(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual(mockResult);
});

test(`Get notification categories for teacher`, async () => {
	ctx.sessionData.user_role = "teacher";
	const params = getParams();
	ctx.appDbQuery = async function (query, values) {
		const queryText = query.replace(/[\s\t\n\r]+/g, " ").trim();
		if (queryText.indexOf("SELECT") !== -1) {
			return { rows: mockResult.items };
		}
		throw new Error("should never get here");
	};
	expect(await getNotificationCategories(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual(mockResult);
});
