const updateNotificationRaw = require("../../core/auth/update-notification");
const Context = require("../common/Context");
let count = 0,
	mockHasUpdated = false;

async function updateNotification(data) {
	let err = null;
	try {
		ctx.body = await updateNotificationRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function resetAll() {
	ctx = new Context();
	mockHasUpdated = false;
	count = 0;
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("COUNT(*)") !== -1) {
			count = Math.random() * 10;
			return {
				rows: [{ unreadnotification: count }],
			};
		}
		if (trimQuery.indexOf("UPDATE notification") !== -1) {
			mockHasUpdated = true;
		}
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Unauthorize if Not logged in`, async () => {
	ctx.sessionData.user_id = null;
	expect(await updateNotification(null)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Identifier is not valid`, async () => {
	let params = {};
	params.oid = "1234";
	expect(await updateNotification(params)).toEqual(new Error("400 ::: Identifier not valid"));
});

test(`update read notification flag`, async () => {
	let params = { oid: "8223b713aa71415463f183856681f9ab6033", has_read: true };
	await updateNotification(params);
	expect(mockHasUpdated).toBe(true);
});
