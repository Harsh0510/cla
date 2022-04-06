const notificationGetFiltersRaw = require("../../core/auth/notification-get-filters");
const Context = require("../common/Context");
const notificationFilters = require("../../common/getNotificationStatus");
let ctx;

async function getNotificationFilter(data) {
	let err = null;
	try {
		ctx.body = await notificationGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Unauthorize if Not logged in`, async () => {
	ctx.sessionData.user_id = null;
	expect(await getNotificationFilter(null)).toEqual(new Error("401 ::: Unauthorized"));
});

test("Return Filters", async () => {
	await getNotificationFilter(null);
	let result = ctx.body;
	expect(result.result[0].data.length).toBe(notificationFilters().length);
});
