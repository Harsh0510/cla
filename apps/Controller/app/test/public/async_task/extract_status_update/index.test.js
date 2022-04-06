const extractStatusUpdateRaw = require("../../../../core/public/async_task/extract_status_update/index");

let isPushedtoNotificationTask = false;
let isCalledTaskDeleted = false;
let mockTaskDetail = new (class TaskDetail {
	async deleteSelf() {
		isCalledTaskDeleted = true;
	}

	async query(query, data) {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`UPDATE extract SET status = activate`) !== -1) {
			return null;
		}
	}
})();
let mockIsIncludeDateEdited;

jest.mock(`../../../../core/public/async_task/extract_status_update/pushTask`, () => {
	return function (task) {
		isPushedtoNotificationTask = true;
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	isPushedtoNotificationTask = false;
	mockIsIncludeDateEdited = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractStatusUpdate() {
	let err = null;
	try {
		result = await extractStatusUpdateRaw(mockTaskDetail);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Function render correctly`, async () => {
	expect(await extractStatusUpdate()).toEqual(null);
	expect(isCalledTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database when unknown error occured`, async () => {
	mockTaskDetail.query = async (query, values) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf(`UPDATE extract SET status`) !== -1) {
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return null;
		}
	};
	expect(await extractStatusUpdate()).toEqual(null);
	expect(isCalledTaskDeleted).toEqual(true);
	expect(isPushedtoNotificationTask).toEqual(true);
	expect(mockIsIncludeDateEdited).toBe(true);
});
