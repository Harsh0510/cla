const assetAvailableEmailLogRaw = require("../../../../core/public/async_task/asset_available_email_log/index");

let isPushedtoNotificationTask, isCalledTaskDeleted, mockResultData, isCalledUserAssetsAvailableEmailSender;
let mockIsIncludeDateEdited;

let mockTaskDetail = new (class TaskDetail {
	async deleteSelf() {
		isCalledTaskDeleted = true;
	}

	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`SELECT`) !== -1) {
			return { results: { rows: [], rowCount: 0 } };
		}
		if (query.indexOf(`UPDATE asset_school_info SET email_processed = TRUE`) !== -1) {
			return null;
		}
	}
})();

jest.mock(`../../../../core/public/async_task/asset_available_email_log/pushTask`, () => {
	return function (task) {
		isPushedtoNotificationTask = true;
	};
});

jest.mock(`../../../../core/public/async_task/asset_available_email_log/unlockNotifierEmailSenderAndFetchSchoolAssetMap`, () => {
	return function (querier, autoUnlockAssets, isTempUnlockAssets) {
		isCalledUserAssetsAvailableEmailSender = true;
		return { "365518_19247": { school_id: 365518, asset_id: 19247 } };
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	isPushedtoNotificationTask = false;
	isCalledTaskDeleted = false;
	isCalledUserAssetsAvailableEmailSender = false;
	mockResultData = [
		{
			user_id: 14758,
			school_id: 365518,
			user_role: "school-admin",
			email: "bhadresh@cla.com",
			first_name: "Bhadresh",
			status: "does-not-exist",
			expiration_date: null,
			asset_id: 19247,
			authors_log: ["abc", "xyz"],
			publisher: "Critical Publishing",
			publication_date: "2020-01-24T00:00:00.000Z",
			edition: 1,
			title: "Positive Mental Health for School Leaders",
			pdf_isbn13: "9781913063047",
			should_receive_email: true,
		},
		{
			user_id: 14758,
			school_id: 365518,
			user_role: "school-admin",
			email: "bhadresh@cla.com",
			first_name: "Bhadresh",
			status: "does-not-exist",
			expiration_date: "2021-08-20T00:00:00.000Z",
			asset_id: 19247,
			authors_log: ["abc", "xyz"],
			publisher: "Critical Publishing",
			publication_date: "2020-01-24T00:00:00.000Z",
			edition: 1,
			title: "Positive Mental Health for School Leaders",
			pdf_isbn13: "9781913063047",
			should_receive_email: false,
		},
	];
	mockIsIncludeDateEdited = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function assetAvailableEmailLog() {
	let err = null;
	try {
		result = await assetAvailableEmailLogRaw(mockTaskDetail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await assetAvailableEmailLog()).toEqual(null);
	expect(isCalledTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
});

test("userAssetsAvailableEmailSender function render correctly", async () => {
	mockTaskDetail.query = async (query, data) => {
		query = query.replace(/\s+/g, " ");

		if (query.indexOf(`SELECT`) !== -1) {
			return { rowCount: 1, rows: mockResultData };
		}
		if (query.indexOf(`UPDATE asset_school_info SET email_processed = TRUE`) !== -1) {
			return null;
		}
	};

	expect(await assetAvailableEmailLog()).toEqual(null);
	expect(isCalledTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
	expect(isCalledUserAssetsAvailableEmailSender).toEqual(true);
});

test(`When only one auto unlock assest is there`, async () => {
	mockTaskDetail.query = async (query, data) => {
		query = query.replace(/\s+/g, " ");

		if (query.indexOf(`SELECT`) !== -1) {
			return { rowCount: 1, rows: [mockResultData[0]] };
		}
		if (query.indexOf(`UPDATE asset_school_info SET email_processed = TRUE`) !== -1) {
			return null;
		}
	};

	expect(await assetAvailableEmailLog()).toEqual(null);
	expect(isCalledTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
	expect(isCalledUserAssetsAvailableEmailSender).toEqual(true);
});

test(`When only one temp unlock assest is there`, async () => {
	mockTaskDetail.query = async (query, data) => {
		query = query.replace(/\s+/g, " ");

		if (query.indexOf(`SELECT`) !== -1) {
			return { rowCount: 1, rows: [mockResultData[1]] };
		}
		if (query.indexOf(`UPDATE asset_school_info SET email_processed = TRUE`) !== -1) {
			return null;
		}
	};

	expect(await assetAvailableEmailLog()).toEqual(null);
	expect(isCalledTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
});

test(`When both temp unlock assest and auto unlock assest is there`, async () => {
	mockTaskDetail.query = async (query, data) => {
		query = query.replace(/\s+/g, " ");

		if (query.indexOf(`SELECT`) !== -1) {
			return { rowCount: 1, rows: [mockResultData[1]] };
		}
		if (query.indexOf(`UPDATE asset_school_info SET email_processed = TRUE`) !== -1) {
			return null;
		}
	};

	expect(await assetAvailableEmailLog()).toEqual(null);
	expect(isCalledTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	mockTaskDetail.query = async (query, data) => {
		query = query.replace(/\s+/g, " ");

		if (query.indexOf(`SELECT`) !== -1) {
			return { rowCount: 1, rows: [mockResultData[1]] };
		}
		if (query.indexOf(`UPDATE asset_school_info SET email_processed = TRUE`) !== -1) {
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return null;
		}
	};

	expect(await assetAvailableEmailLog()).toEqual(null);
	expect(isCalledTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
	expect(mockIsIncludeDateEdited).toBe(true);
});
