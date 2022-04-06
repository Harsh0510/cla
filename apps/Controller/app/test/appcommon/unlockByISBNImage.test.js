const unlockByISBNImage = require("../../common/unlockByISBNImage");
const Context = require("../common/Context");
let returnIsbnAvailable = true;
let doThrowException = false;
let isRollbackCalled = false;
let returnNull = false;
let returnNotificationNull = false;
let mockDbPool, mockResultAssets;
let mockIsIncludeModifyUserIdOnConflict;
let mockIsIncludeDateEditedOnConflict;
function resetAll() {
	returnIsbnAvailable = true;
	doThrowException = false;
	returnNull = false;
	returnNotificationNull = false;
	ctx = new Context();
	mockResultAssets = {
		rows: [
			{
				id: 2,
				title: "Dummy Asset Title",
				publisher_name: "Some publisher",
			},
		],
		rowCount: 1,
	};
	mockDBQueryCall = async (query, values) => {
		query = query.trim().replace(/\s+/g, " ");
		if (query.indexOf("SELECT cla_user.email AS email, school.id AS school_id, school.name AS school_name ") !== -1) {
			if (doThrowException) {
				ctx.throw(400, "Something gone wrong");
			} else if (returnNull) {
				return {
					rowCount: 0,
				};
			} else {
				return {
					rows: [
						{
							email: "test@email.com",
							school_id: 7,
							school_name: "School Test",
						},
					],
					rowCount: 1,
				};
			}
		} else if (query.indexOf("SELECT unlock_image_upload.*,cla_user.school_id") !== -1) {
			if (doThrowException) {
				ctx.throw(400, "Something gone wrong");
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
			if (returnNotificationNull) {
				return {
					rowCount: 0,
				};
			} else {
				return {
					rows: [
						{
							id: 1,
							name: "Book Unlock",
							hideable: true,
						},
					],
					rowCount: 1,
				};
			}
		} else if (query.indexOf("FROM asset") !== -1) {
			return returnIsbnAvailable
				? mockResultAssets
				: {
						rowCount: 0,
				  };
		} else if (query.indexOf("INSERT INTO asset_school_info") !== -1) {
			if (query.indexOf("ON CONFLICT (school_id, asset_id) DO UPDATE") !== -1) {
				mockIsIncludeModifyUserIdOnConflict = query.indexOf("modified_by_user_id") !== -1 ? true : false;
				mockIsIncludeDateEditedOnConflict = query.indexOf("date_edited") !== -1 ? true : false;
			}
			return {
				rows: [
					{
						test: "Asset School Info",
					},
				],
				rowCount: 1,
			};
		} else if (query.indexOf("UPDATE unlock_image_upload") !== -1) {
			return {
				rows: [
					{
						unlock_image_upload: true,
					},
				],
				rowCount: 1,
			};
		} else if (query.indexOf("INTO notification") !== -1) {
			return {
				rows: [
					{
						inserted: true,
					},
				],
				rowCount: 1,
			};
		} else if (query.indexOf("INTO unlock_attempt")) {
			return {
				rows: [
					{
						unlock_success: true,
						oid: "c4701bcb1c5b79381e0be91ad17a9ee71fe2",
					},
				],
				rowCount: 1,
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
	mockDbPool = ctx.getAppDbPool();
	mockDbPool.query = mockDBQueryCall;
	ctx.release = () => {
		return true;
	};
	ctx.appDbQuery = mockDBQueryCall;
	ctx.release = () => {};
	mockIsIncludeModifyUserIdOnConflict = false;
	mockIsIncludeDateEditedOnConflict = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function unlockByISBNImageRaw(mockDbPool, userDbId, isbnFound) {
	try {
		ctx.body = await unlockByISBNImage(mockDbPool, userDbId, isbnFound, true);
	} catch (e) {
		return e;
	}
}

test("ISBN is valid and is available on platform", async () => {
	doThrowException = false;
	expect(await unlockByISBNImage(mockDbPool, 7, 1234567)).toBe(undefined);
});

test("ISBN is valid and book is not available on platform", async () => {
	returnIsbnAvailable = false;
	expect(await unlockByISBNImage(mockDbPool, 7, 1234567)).toBe(undefined);
});

test("ISBN is not valid or is not present", async () => {
	expect(await unlockByISBNImage(mockDbPool, 7, 1234567)).toBe(undefined);
});

test("Test when user data Could not fetch", async () => {
	returnNull = true;
	const item = await unlockByISBNImageRaw(mockDbPool, 7, 1234567);
	expect(item).toEqual(new Error("Could not fetch user data"));
});

test("Test when isbn is not found", async () => {
	const item = await unlockByISBNImageRaw(mockDbPool, 7, null);
	expect(item).toEqual(undefined);
});

test("Test when notification category Could not fetch", async () => {
	returnNotificationNull = true;
	const item = await unlockByISBNImageRaw(mockDbPool, 7, 1234567);
	expect(item).toEqual(new Error("Could not fetch notification category"));
});

test("Test when asset is already unlocked", async () => {
	mockResultAssets = {
		rows: [
			{
				id: 2,
				title: "Dummy Asset Title",
				publisher_name: "some publisher",
				is_unlocked: true,
			},
		],
		rowCount: 1,
	};
	const item = await unlockByISBNImageRaw(mockDbPool, 7, 1234567);
	expect(item).toEqual(undefined);
});

test("Ensure when conflict occurs, modified_by_user_id and date_edited are updated successfully on database", async () => {
	doThrowException = false;
	expect(await unlockByISBNImageRaw(mockDbPool, 7, 1234567)).toBe(undefined);
	expect(mockIsIncludeModifyUserIdOnConflict).toBe(true);
	expect(mockIsIncludeDateEditedOnConflict).toBe(true);
});
