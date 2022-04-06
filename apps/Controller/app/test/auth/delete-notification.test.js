const deleteNotificationRaw = require("../../core/auth/delete-notification");
const Context = require("../common/Context");
let mockHasDeleted = false,
	deleteAllNotification = false,
	singleNotificationDelete = false,
	mockHasRecordInsertedinDisabledCat = false,
	mockHideableCount;

async function deleteNotification(data) {
	let err = null;
	try {
		ctx.body = await deleteNotificationRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function resetAll() {
	ctx = new Context();
	mockHasDeleted = false;
	deleteAllNotification = false;
	singleNotificationDelete = false;
	mockHasRecordInsertedinDisabledCat = false;
	count = 0;
	mockHideableCount = 0;
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("notification_category") !== -1) {
			if (mockHideableCount > 0) {
				return { rows: [{ id: 1 }] };
			}
			return { rows: [] };
		}
		if (trimQuery.indexOf("COUNT(*)") !== -1) {
			count = Math.random() * 10;
			return count;
		}
		if (trimQuery.indexOf("DELETE FROM") !== -1) {
			mockHasDeleted = true;
			return {
				rowCount: 1,
			};
		}
		if (trimQuery.indexOf("INSERT INTO") !== -1) {
			mockHasRecordInsertedinDisabledCat = true;
			return {
				rowCount: 1,
			};
		}
	};
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Unauthorize if Not logged in`, async () => {
	ctx.sessionData.user_id = null;
	expect(await deleteNotification(null)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`invalid category`, async () => {
	let params = { categoryId: "abc" };
	expect(await deleteNotification(params)).toEqual(new Error("400 ::: Category Id invalid"));
	params.categoryId = -3;
	expect(await deleteNotification(params)).toEqual(new Error("400 ::: Category Id must not be negative"));
});

test(`delete all notification by Catgory`, async () => {
	let params = { categoryId: 1 };
	await deleteNotification(params);
	expect(mockHasDeleted).toBe(true);
	expect(mockHasRecordInsertedinDisabledCat).toBe(true);
});

test(`invalid oid`, async () => {
	let params = { oid: "123456" };
	expect(await deleteNotification(params)).toEqual(new Error("400 ::: Identifier not valid"));
});

test(`delete single notification`, async () => {
	let params = { oid: "8223b713aa71415463f183856681f9ab6033" };
	await deleteNotification(params);
	expect(mockHasDeleted).toBe(true);
});

test(`Don't delete all notification by Catgory`, async () => {
	let params = { categoryId: 1 };
	mockHideableCount = 1;
	await deleteNotification(params);
	expect(mockHasDeleted).toBe(false);
	expect(mockHasRecordInsertedinDisabledCat).toBe(false);
});

test(`Could not delete notification`, async () => {
	let params = { oid: "8223b713aa71415463f183856681f9ab6033", categoryId: false };
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("DELETE FROM") !== -1) {
			throw new Error("400 ::: Could not delete notification");
		}
	};
	expect(await deleteNotification(params)).toEqual(new Error("400 ::: Could not delete notification"));
});
