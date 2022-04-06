const getNotificationRaw = require("../../core/auth/get-notification");
const Context = require("../common/Context");
let ctx,
	count = null,
	notificationData,
	mockShowAll = false;

function getDefaultParams() {
	return {
		getCount: false,
		limit: 10,
		offset: 0,
		sort_direction: "D",
		sort_field: "title",
		query: "",
		filter: {
			status: [],
		},
	};
}

async function getNotification(data) {
	let err = null;
	try {
		ctx.body = await getNotificationRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function resetAll() {
	ctx = new Context();
	count = null;
	mockShowAll = false;
	notificationData = null;
	ctx.appDbQuery = async (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT has_read") !== -1) {
			if (mockShowAll) {
				notificationData = {
					rows: [
						{ has_read: false, date_created: "10-10-2019" },
						{ has_read: true, date_created: "05-10-2019" },
					],
					totalNotificationCount: 2,
					unread_count: parseInt(Math.random() * 10, 10),
				};
			} else {
				notificationData = {
					rows: [{ has_read: false, date_created: "10-10-2019" }],
					unread_count: parseInt(Math.random() * 10, 10),
					totalNotificationCount: 1,
				};
			}

			return notificationData;
		}
		if (trimQuery.indexOf("COUNT(*)") !== -1) {
			count = Math.random() * 10;
			return {
				rows: [{ unreadnotification: count }],
			};
		}
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Unauthorize if Not logged in`, async () => {
	ctx.sessionData.user_id = null;
	expect(await getNotification(null)).toEqual(new Error("401 ::: Unauthorized"));
});

test("Return only Count", async () => {
	let params = getDefaultParams();
	params.getCount = true;
	await getNotification(params);
	expect(count).toBeGreaterThanOrEqual(0);
});

test("Return Notifications", async () => {
	let params = getDefaultParams();
	params.getCount = false;
	await getNotification(params);
	expect(notificationData.rows.length).toBe(1);
});

test("Fetch All Notification", async () => {
	let params = getDefaultParams();
	params.getCount = false;
	params.showAll = true;
	mockShowAll = true;
	await getNotification(params);
	expect(notificationData.rows.length).toBe(2);
});

test("validate params", async () => {
	let params = getDefaultParams();
	params.limit = -5;
	params.getCount = false;
	expect(await getNotification(params)).toEqual(new Error("400 ::: Limit must not be negative"));
	params.limit = 10;
	params.offset = -5;
	expect(await getNotification(params)).toEqual(new Error("400 ::: Offset must not be negative"));
	params.offset = 0;
	params.sort_direction = "E";
	expect(await getNotification(params)).toEqual(new Error("400 ::: Invalid sort direction"));
	params.sort_direction = "ASC";
	params.sort_field = "fake_field";
	expect(await getNotification(params)).toEqual(new Error("400 ::: Sort field not found"));
	params.sort_field = "description";
	params.query = 3;
	expect(await getNotification(params)).toEqual(new Error("400 ::: Query invalid"));
	params.query = "";
	params.filter.status = ["fake"];
	expect(await getNotification(params)).toEqual(new Error("400 ::: Invalid Status"));
});

test("When no params are provided ", async () => {
	let params = "";
	await getNotification(params);
	expect(notificationData.rows.length).toBe(1);
});

test("Valid filters are provided", async () => {
	let params = getDefaultParams();
	params.query = "test";
	params.filter = {};
	await getNotification(params);
	expect(notificationData.rows.length).toBe(1);
	params.filter.status = ["0", "1"];
	await getNotification(params);
	expect(notificationData.rows.length).toBe(1);
});
