const unlockRaw = require("../../core/public/unlock.js");
const Context = require("../common/Context");

let ctx;

let mockAssetResultData;
let mockUserData;
let mockAssetUnlockData;
let mockUnlockAttemptInsertData;
let mockAssetSchoolInfoInsertData;
let mockIsSendUserAlertTempUnlockedEmailToEP;
let mockIsSendSchoolrAlertTempUnlockedEmailToEP;
let mockIsIncludeModifyUserIdOnConflict;
let mockIsIncludeDateEditedOnConflict;

/** mock for isbn */
jest.mock("isbn", () => ({
	ISBN: {
		parse(a) {
			let p;
			if (a === "9876543210321") {
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

const mockObjectIdentifier = `012345678901234567890123456789012345`;
const mockGetExtractExpiryDate = "2021-03-30 14:50:21.966348+00";

jest.mock("#tvf-util", () => ({
	async generateObjectIdentifier() {
		return mockObjectIdentifier;
	},
}));

jest.mock(`../../common/getExtractExpiryDate`, () => {
	return function () {
		return mockGetExtractExpiryDate;
	};
});

jest.mock(`../../common/updateExtractExpiryDate`, () => {
	return async function () {
		return;
	};
});

jest.mock(`../../core/public/common/sendTempUnlockedEmailToUser`, () => {
	return async function () {
		return;
	};
});

jest.mock(`../../core/public/common/sendTempUnlockedEmailToEP`, () => {
	return async function () {
		return;
	};
});

jest.mock(`../../core/public/common/sendUserAlertTempUnlockedEmailToEP`, () => {
	return async function () {
		mockIsSendUserAlertTempUnlockedEmailToEP = true;
		return;
	};
});

jest.mock(`../../core/public/common/sendSchoolAlertTempUnlockedEmailToEP`, () => {
	return async function () {
		mockIsSendSchoolrAlertTempUnlockedEmailToEP = true;
		return;
	};
});

const defaultQuery = async (query, values) => {
	query = query.trim().replace(/\s+/g, " ");
	if (query.indexOf(`SELECT asset.id AS id, asset.title AS title, asset.isbn13 AS isbn13,`) >= 0) {
		return mockAssetResultData;
	}
	if (query.indexOf(`SELECT ( asset.auto_unlocked OR ( COALESCE(asset_school_info.is_unlocked, FALSE)`) >= 0) {
		return mockAssetUnlockData;
	}
	if (
		query.indexOf(
			`SELECT cla_user.email AS user_email, cla_user.first_name AS first_name, school.name AS school_name, school.academic_year_end_month AS academic_year_end_month,`
		) >= 0
	) {
		return mockUserData;
	}
	if (
		query.indexOf(
			`INSERT INTO unlock_attempt (user_id, user_email, school_id, school_name, isbn, status, asset_id, event, oid, expiration_date, asset_title, publisher_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
		) >= 0
	) {
		return mockUnlockAttemptInsertData;
	}
	if (query.indexOf(`INSERT INTO asset_school_info (school_id, asset_id, is_unlocked, user_id, expiration_date) VALUES ($1, $2, $3, $4,`) >= 0) {
		if (query.indexOf("ON CONFLICT (school_id, asset_id) DO UPDATE") !== -1) {
			mockIsIncludeModifyUserIdOnConflict = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEditedOnConflict = query.indexOf("date_edited") !== -1 ? true : false;
		}
		return mockAssetSchoolInfoInsertData;
	}
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	ctx.appDbQuery = defaultQuery;
	mockUserData = {
		rowCount: 1,
		rows: [
			{
				user_email: "dummy@email.com",
				first_name: "first name",
				school_name: "School Test A",
				academic_year_end_month: 7,
				academic_year_end_day: 30,
			},
		],
	};
	mockAssetResultData = {
		rowCount: 1,
		rows: [
			{
				id: 1,
				title: "Book test",
				isbn13: "9876543210321",
				pdf_isbn13: "9876543210321",
				temp_unlock_opt_in: false,
				publisher_name: "test publisher",
			},
		],
	};
	mockUnlockAttemptInsertData = {
		rowCount: 0,
		rows: [],
	};
	mockAssetSchoolInfoInsertData = {
		rowCount: 1,
		rows: [
			{
				expiration_date: null,
			},
		],
	};
	mockAssetUnlockData = {
		rowCount: 1,
		rows: [
			{
				is_unlocked: false,
				expiration_date: null,
				is_temp_expired: false,
			},
		],
	};
	mockIsSendSchoolrAlertTempUnlockedEmailToEP = false;
	mockIsSendUserAlertTempUnlockedEmailToEP = false;
	mockIsIncludeModifyUserIdOnConflict = false;
	mockIsIncludeDateEditedOnConflict = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(() => {
	jest.resetModules();
	resetAll();
});
afterEach(resetAll);

async function unlock(data) {
	let err = null;
	try {
		ctx.body = await unlockRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		isbn13: "9781910504734",
		is_temp: false,
	};
}

describe("For Physically unlock asset", () => {
	test(`Error when no ISBN13 provided`, async () => {
		const params = getParams();
		delete params.isbn13;
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN not provided"));
	});

	test(`Error when pass with ISBN13 invalid`, async () => {
		const params = getParams();
		params.isbn13 = ["99-6857-457"];
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN invalid"));
	});

	test(`Error when ISBN13 not valid`, async () => {
		const params = getParams();
		params.isbn13 = "99-685-7457-111111";
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN is not valid"));
	});

	test(`Error when pass with alphanumeric ISBN13`, async () => {
		const params = getParams();
		params.isbn13 = "99685745700AB";
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN is not valid"));
	});

	test(`Error when pass with invalid ISBN13`, async () => {
		const params = getParams();
		params.isbn13 = "9968574570000";
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN is not valid"));
	});

	test(`Error when not logged in`, async () => {
		const params = getParams();
		ctx.sessionData = null;
		expect(await unlock(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
	});

	test(`Error when not logged in`, async () => {
		const params = getParams();
		ctx.sessionData = null;
		expect(await unlock(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
	});

	test(`Successfully unlock when logged in as teacher`, async () => {
		const params = getParams();
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				publisher_name: "test publisher",
				title: "Book test",
			},
			status: `successfully-unlocked`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
	});

	test(`Returning an error when no asset is found by ISBN`, async () => {
		const params = getParams();
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		ctx.appDbQuery = (_) => new Promise((resolve, reject) => resolve({ rows: [] }));
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {},
			status: `does-not-exist`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
	});

	test(`Returning an error when asset is already unlocked`, async () => {
		const params = getParams();
		ctx.sessionData.school_id = 1;
		mockAssetResultData = {
			rowCount: 1,
			rows: [
				{
					id: 1,
					title: "Book test",
					isbn13: "9876543210321",
					pdf_isbn13: "9876543210321",
					temp_unlock_opt_in: false,
					publisher_name: "test publisher",
				},
			],
		};
		mockAssetUnlockData = {
			rowCount: 1,
			rows: [
				{
					is_unlocked: true,
					expiration_date: null,
					is_temp_expired: false,
				},
			],
		};
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				message: "Asset already unlocked",
				publisher_name: "test publisher",
				title: "Book test",
			},
			unlock_attempt_oid: mockObjectIdentifier,
			status: `already-unlocked`,
		});
	});

	test(`Returning error while execution user information [1]`, async () => {
		ctx.appDbQuery = async (query, values) => {
			if (query === "BEGIN") {
				throw new Error("Unknown Error");
			}
		};

		const params = getParams();
		ctx.sessionData.school_id = 5;
		expect(await unlock(params, ctx)).toEqual(new Error("500 ::: An unexpected error has occurred"));
		expect(ctx.body).toBeNull();
	});

	test(`Returning error while execution user information [2]`, async () => {
		ctx.appDbQuery = async (query, values) => {
			query = query.trim().replace(/\s+/g, " ");
			if (
				query.indexOf(`INSERT INTO unlock_attempt (user_id, user_email, school_id, school_name, isbn, status) VALUES ($1, $2, $3, $4, $5, $6)`) >= 0
			) {
				throw new Error("Unknown Error");
			}
			if (query.indexOf(`INSERT INTO asset_school_info (school_id, asset_id, is_unlocked) VALUES ($1, $2, $3)`) >= 0) {
				return {
					expiration_date: null,
				};
			}
			defaultQuery(query);
		};

		const params = getParams();
		ctx.sessionData.school_id = 5;
		expect(await unlock(params, ctx)).toEqual(new Error("500 ::: An unexpected error has occurred"));
		expect(ctx.body).toBeNull();
	});

	test(`Returning error while execution user information [3]`, async () => {
		ctx.appDbQuery = async (query, values) => {
			query = query.trim().replace(/\s+/g, " ");
			if (
				query.indexOf(
					`INSERT INTO unlock_attempt (user_id, user_email, school_id, school_name, isbn, was_unlocked) VALUES ($1, $2, $3, $4, $5, $6)`
				) >= 0
			) {
				return {};
			}
			if (query.indexOf(`INSERT INTO asset_school_info (school_id, asset_id, is_unlocked) VALUES ($1, $2, $3)`) >= 0) {
				throw new Error("Unknown Error");
			}
			defaultQuery(query, values);
		};

		const params = getParams();
		ctx.sessionData.school_id = 5;
		expect(await unlock(params, ctx)).toEqual(new Error("500 ::: An unexpected error has occurred"));
		expect(ctx.body).toBeNull();
	});

	test(`Ensure when conflict occurs and user role is teacher, modified_by_user_id and date_edited are updated successfully in database`, async () => {
		const params = getParams();
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				publisher_name: "test publisher",
				title: "Book test",
			},
			status: `successfully-unlocked`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
		expect(mockIsIncludeModifyUserIdOnConflict).toBe(true);
		expect(mockIsIncludeDateEditedOnConflict).toBe(true);
	});
});

////// Unlock Without Physical copy

describe("For temporarily unlock", () => {
	test(`Error when no ISBN13 provided`, async () => {
		const params = getParams();
		delete params.isbn13;
		params.is_temp = true;
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN not provided"));
	});

	test(`Error when pass with ISBN13 invalid`, async () => {
		const params = getParams();
		params.isbn13 = ["99-6857-457"];
		params.is_temp = true;
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN invalid"));
	});

	test(`Error when ISBN13 not valid`, async () => {
		const params = getParams();
		params.isbn13 = "99-685-7457-111111";
		params.is_temp = true;
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN is not valid"));
	});

	test(`Error when pass with alphanumeric ISBN13`, async () => {
		const params = getParams();
		params.isbn13 = "99685745700AB";
		params.is_temp = true;
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN is not valid"));
	});

	test(`Error when pass with invalid ISBN13`, async () => {
		const params = getParams();
		params.isbn13 = "9968574570000";
		params.is_temp = true;
		expect(await unlock(params, ctx)).toEqual(new Error("400 ::: ISBN is not valid"));
	});

	test(`Error when not logged in`, async () => {
		const params = getParams();
		params.is_temp = true;
		ctx.sessionData = null;
		expect(await unlock(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
	});

	test(`Error when not logged in`, async () => {
		const params = getParams();
		params.is_temp = true;
		ctx.sessionData = null;
		expect(await unlock(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
	});

	test(`User Try to temporary unlock book when publisher is publisher-restricted `, async () => {
		const params = getParams();
		params.is_temp = true;
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				publisher_name: "test publisher",
				title: "Book test",
			},
			status: `publisher-restricted`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
	});

	test(`Returning an error when asset is already unlocked`, async () => {
		mockAssetResultData.rows[0].temp_unlock_opt_in = true;
		mockAssetUnlockData = {
			rowCount: 1,
			rows: [
				{
					is_unlocked: true,
					expiration_date: "2021-03-30 14:50:21.966348+00",
					is_temp_expired: false,
				},
			],
		};

		const params = getParams();
		params.is_temp = true;
		params.is_temp_confirmed = true;
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				message: "Asset already unlocked",
				publisher_name: "test publisher",
				title: "Book test",
			},
			status: `already-unlocked`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
	});

	test(`When temporarily unlocked expired`, async () => {
		mockAssetResultData.rows[0].temp_unlock_opt_in = true;
		mockAssetUnlockData = {
			rowCount: 1,
			rows: [
				{
					is_unlocked: true,
					expiration_date: "2021-03-30 14:50:21.966348+00",
					is_temp_expired: true,
				},
			],
		};
		const params = getParams();
		params.is_temp = true;
		params.is_temp_confirmed = true;
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				message: "Asset already unlocked",
				publisher_name: "test publisher",
				title: "Book test",
			},
			status: `temp-unlocked-expired`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
	});

	test(`When temp-unlocked-must-confirm`, async () => {
		mockAssetResultData.rows[0].temp_unlock_opt_in = true;
		const params = getParams();
		params.is_temp = true;
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				publisher_name: "test publisher",
				title: "Book test",
			},
			status: `temp-unlocked-must-confirm`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
	});

	test(`When book is not in user school `, async () => {
		mockAssetResultData.rows[0].temp_unlock_opt_in = true;
		const params = getParams();
		params.is_temp = true;
		params.is_temp_confirmed = false;
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				publisher_name: "test publisher",
				title: "Book test",
			},
			status: `not-owned-by-school`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
	});

	test(`User Try to temporary unlock book when book is already temporary unlock`, async () => {
		mockAssetResultData.rows[0].temp_unlock_opt_in = true;
		mockAssetUnlockData = {
			rowCount: 1,
			rows: [
				{
					is_unlocked: true,
					expiration_date: "2021-03-30 14:50:21.966348+00",
					is_temp_expired: false,
				},
			],
		};
		mockAssetSchoolInfoInsertData = {
			rowCount: 1,
			rows: [
				{
					expiration_date: "2021-03-30 14:50:21.966348+00",
				},
			],
		};
		const params = getParams();
		params.is_temp = true;
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				publisher_name: "test publisher",
				title: "Book test",
				message: "Asset already unlocked",
			},
			status: `already-unlocked`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
	});

	test(`When user unlocked the asset phisically of temporarily unlocked asset`, async () => {
		mockAssetResultData.rows[0].temp_unlock_opt_in = true;
		mockAssetUnlockData = {
			rowCount: 1,
			rows: [
				{
					is_unlocked: true,
					expiration_date: "2021-03-30 14:50:21.966348+00",
					is_temp_expired: false,
				},
			],
		};

		const params = getParams();
		params.is_temp = false;
		params.is_temp_confirmed = true;
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				publisher_name: "test publisher",
				title: "Book test",
				message: "Asset already unlocked",
			},
			status: `successfully-unlocked`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
	});

	test(`User successfuly temporarily unlocked asset and alert mail send to EP`, async () => {
		mockAssetResultData.rows[0].temp_unlock_opt_in = true;
		const params = getParams();
		params.is_temp = true;
		params.is_temp_confirmed = true;
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				publisher_name: "test publisher",
				title: "Book test",
			},
			status: `temp-unlocked`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
		expect(mockIsSendUserAlertTempUnlockedEmailToEP).toBe(true);
		expect(mockIsSendSchoolrAlertTempUnlockedEmailToEP).toBe(true);
	});

	test(`Ensure when conflict occurs and user temporary unlocks asset, modified_by_user_id and date_edited are updated successfully in database`, async () => {
		mockAssetResultData.rows[0].temp_unlock_opt_in = true;
		const params = getParams();
		params.is_temp = true;
		params.is_temp_confirmed = true;
		ctx.sessionData.school_id = 5;
		ctx.sessionData.user_role = "teacher";
		expect(await unlock(params, ctx)).toBeNull();
		expect(ctx.body).toEqual({
			result: {
				isbn: "9876543210321",
				publisher_name: "test publisher",
				title: "Book test",
			},
			status: `temp-unlocked`,
			unlock_attempt_oid: mockObjectIdentifier,
		});
		expect(mockIsSendUserAlertTempUnlockedEmailToEP).toBe(true);
		expect(mockIsSendSchoolrAlertTempUnlockedEmailToEP).toBe(true);
		expect(mockIsIncludeModifyUserIdOnConflict).toBe(true);
		expect(mockIsIncludeDateEditedOnConflict).toBe(true);
	});
});
