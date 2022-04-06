const unlockImageUploadUpdateRaw = require("../../core/admin/unlock-image-upload-update");
const Context = require("../common/Context");

const GOOD_OID = "1cfdfc7541b51b7d61ff70cced0594991d4e";
const GOOD_ISBN = "9781910504734";
let returnIsbnAvailable = true;
let doThrowException = false;
let isRollbackCalled = false;
let ctx;
let MockGnotification_category;
let MockGetUnlockImageRecord;
let mockIsIncludeDateEditedOnConflict;
let mockIsIncludeModifyUserIdOnConflict;
jest.mock("isbn", () => ({
	ISBN: {
		parse(a) {
			let p;
			if (a === "9781910504734") {
				p = {
					asIsbn13() {
						return a;
					},
					isValid() {
						return true;
					},
				};
			} else {
				p = {
					isValid() {
						return false;
					},
				};
			}
			return p;
		},
	},
}));

function getValidRequest() {
	return {
		isApproved: true,
		reject_reason: "Testing",
		pdf_isbn13: GOOD_ISBN,
		oid: GOOD_OID,
	};
}

function resetAll() {
	ctx = new Context();
	ctx.doAppQuery = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("FROM unlock_image_upload") !== -1) {
			if (doThrowException) {
				ctx.throw("500", "An unexpected error has occurred");
			} else {
				return {
					rows: [
						{
							user_id: 605,
							school_id: 7,
							user_email_log: "test@email.com",
							school_name_log: "School Test",
						},
					],
					rowCount: 1,
				};
			}
		} else if (query.indexOf("FROM notification_category") !== -1) {
			return {
				rows: [
					{
						id: 1,
						name: "Book Unlock",
					},
				],
			};
		} else if (query.indexOf("FROM asset") !== -1) {
			return returnIsbnAvailable
				? {
						rows: [
							{
								id: 2,
								title: "Dummy Asset Title",
							},
						],
						rowCount: 1,
				  }
				: {
						rowCount: 0,
				  };
		} else if (query.indexOf("INSERT INTO asset_school_info") !== -1) {
			if (query.indexOf("ON CONFLICT (school_id, asset_id) DO UPDATE") !== -1) {
				mockIsIncludeDateEditedOnConflict = query.indexOf("date_edited") !== -1 ? true : false;
				mockIsIncludeModifyUserIdOnConflict = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			}
			return {
				rows: [
					{
						test: "Asset School Info",
					},
				],
			};
		} else if (query.indexOf("UPDATE unlock_image_upload") !== -1) {
			return {
				rows: [
					{
						unlock_image_upload: true,
					},
				],
			};
		} else if (query.indexOf("INTO notification") !== -1) {
			return {
				rows: [
					{
						inserted: true,
					},
				],
			};
		} else if (query.indexOf("INTO unlock_attempt")) {
			return {
				rows: [
					{
						unlock_success: true,
					},
				],
			};
		} else if (query.indexOf("BEGIN") !== -1) {
			return true;
		} else if (query.indexOf("COMMIT") !== -1) {
			return true;
		} else if (query.indexOf("ROLLBACK") !== -1) {
			isRollbackCalled = true;
			return true;
		}
	};
	ctx.release = () => {};

	MockGnotification_category = {
		user_id: 605,
		user_email_log: "brad.scott@cla.co.uk",
		school_name_log: "Custom House (CLA) School",
		id: 605,
		school_id: 28,
	};
	MockGetUnlockImageRecord = { id: 4, name: "Book Unlock" };
	returnIsbnAvailable = true;
	doThrowException = false;
	mockIsIncludeDateEditedOnConflict = false;
	mockIsIncludeModifyUserIdOnConflict = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function unlockImageUploadUpdate(data) {
	let err = null;
	try {
		ctx.body = await unlockImageUploadUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is not a cla admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await unlockImageUploadUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user not provided pdf_isbn13`, async () => {
	const data = getValidRequest();
	data.isApproved = true;
	delete data.pdf_isbn13;
	ctx.sessionData.user_role = "cla-admin";
	expect(await unlockImageUploadUpdate(data)).toEqual(new Error("400 ::: ISBN not provided"));
});

test(`Error when user provided invalid pdf_isbn13`, async () => {
	const data = getValidRequest();
	data.isApproved = true;
	data.pdf_isbn13 = "5465654654";
	ctx.sessionData.user_role = "cla-admin";
	expect(await unlockImageUploadUpdate(data)).toEqual(new Error("400 ::: ISBN isn't valid"));
});

test(`Error when user not provided oid`, async () => {
	const data = getValidRequest();
	delete data.oid;
	ctx.sessionData.user_role = "cla-admin";
	expect(await unlockImageUploadUpdate(data)).toEqual(new Error("400 ::: Identifier not provided"));
});

test(`Error when Rejecting without reason`, async () => {
	const data = getValidRequest();
	data.isApproved = false;
	data.reject_reason = "";
	expect(await unlockImageUploadUpdate(data)).toEqual(new Error("400 ::: Reject reason not provided"));
});

test(`When request is rejected by admin`, async () => {
	const data = getValidRequest();
	data.isApproved = false;
	await unlockImageUploadUpdate(data);
	expect(ctx.body).toMatchObject({
		result: {
			isNotificationCreated: true,
			isUnlockAttemptCreated: false,
			isUnlockImageUpdated: true,
		},
	});
});

test(`When request is approved by admin and book is available on platform`, async () => {
	const data = getValidRequest();
	data.isApproved = true;
	await unlockImageUploadUpdate(data);
	expect(ctx.body).toMatchObject({
		result: {
			isNotificationCreated: true,
			isUnlockAttemptCreated: true,
			isUnlockImageUpdated: true,
		},
	});
});

test(`When request is approved but asset is not available on platform`, async () => {
	const data = getValidRequest();
	data.isApproved = true;
	returnIsbnAvailable = false;
	await unlockImageUploadUpdate(data);
	expect(ctx.body).toMatchObject({
		result: {
			isNotificationCreated: true,
			isUnlockAttemptCreated: true,
			isUnlockImageUpdated: true,
		},
	});
});

test(`Handle Exception`, async () => {
	const data = getValidRequest();
	data.isApproved = true;
	doThrowException = true;
	expect(await unlockImageUploadUpdate(data)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test(`Reject Reason Can't be greater then 100 characters`, async () => {
	const data = getValidRequest();
	data.isApproved = false;
	data.reject_reason =
		"Reject reason can't be greater then 100 charactersReject reason can't be greater then 100 charactersReject reason can't be greater then 100 charactersReject reason can't be greater then 100 charactersReject reason can't be greater then 100 charactersReject reason can't be greater then 100 charactersReject reason can't be greater then 100 charactersReject reason can't be greater then 100 characters";
	expect(await unlockImageUploadUpdate(data)).toEqual(new Error("400 ::: Reject reason can't be greater then 100 characters"));
});

test(`Ensure when conflict occurs, modified_by_user_id and date_edited are updated successfully in database`, async () => {
	const data = getValidRequest();
	data.isApproved = true;
	await unlockImageUploadUpdate(data);
	expect(ctx.body).toMatchObject({
		result: {
			isNotificationCreated: true,
			isUnlockAttemptCreated: true,
			isUnlockImageUpdated: true,
		},
	});
	expect(mockIsIncludeModifyUserIdOnConflict).toBe(true);
	expect(mockIsIncludeDateEditedOnConflict).toBe(true);
});
