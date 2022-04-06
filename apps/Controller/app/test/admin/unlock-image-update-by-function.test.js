const unlockImageUpdateByFunctionRaw = require("../../core/admin/unlock-image-update-by-function");
const context = require("../common/Context");

let ctx, mockResultNotification, mockResultUnlock;

/** Mock of unlockByISBNImage */
jest.mock("../../common/unlockByISBNImage", () => {
	return function () {
		return 253;
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
	mockResultNotification = {
		rows: [
			{
				id: 1,
				name: "Awaiting Approval",
			},
			{
				id: 2,
				name: "Unlocked",
			},
		],
	};
	mockResultUnlock = {
		rows: [
			{
				id: 14,
				user_id: 8,
				user_email_log: "teachera4@email.com",
				school_name_log: "Greenwich Observatory (CLA) School",
			},
		],
		rowCount: 1,
	};
	ctx.getUserRole = defaultGetUserRole("cla-admin");
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("FROM notification_category") !== -1) {
			return mockResultNotification;
		}
		if (trimQuery.indexOf("FROM unlock_image_upload") !== -1) {
			return mockResultUnlock;
		}
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/** Common function */
function defaultGetUserRole(role) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(role);
		});
	};
}

async function unlockImageUpdateByFunction(data) {
	let err = null;
	try {
		ctx.body = await unlockImageUpdateByFunctionRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		isApproved: false,
		reject_reason: "Reject reason",
		pdf_isbn13: "9780008144678",
		oid: "1457896325123",
	};
}

test(`Error when user is not cla-admin`, async () => {
	const params = getParams();
	ctx.sessionData.user_role = "teacher";
	const res = await unlockImageUpdateByFunction(params);
	expect(res).toEqual(new Error("400 ::: Unauthorize"));
});

test(`Returns undefined when not approved`, async () => {
	const params = getParams();
	expect(await unlockImageUpdateByFunction(params)).toBeNull();
	expect(ctx.body).toEqual(undefined);
});

test(`Returns undefined when get 0 rowcount`, async () => {
	const params = getParams();
	mockResultUnlock.rowCount = 0;
	expect(await unlockImageUpdateByFunction(params)).toBeNull();
	expect(ctx.body).toEqual(undefined);
});

test(`Returns result Successfully`, async () => {
	const params = getParams();
	params.isApproved = true;
	expect(await unlockImageUpdateByFunction(params)).toBeNull();
	expect(ctx.body).toEqual(253);
});
