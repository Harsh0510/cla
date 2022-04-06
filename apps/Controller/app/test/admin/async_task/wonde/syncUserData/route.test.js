const syncWondeUserData = require("../../../../../core/admin/async_task/wonde/syncUserData/route");

let mockIsTaskPushed = false;
let mockProcessUsersForSchool = [];
let mockQuery = () => {};
let mockTaskDetail;
let mockIsTaskDeleted = false;
let mockIsIncludeDateEdited;

jest.mock("../../../../../core/admin/async_task/wonde/syncUserData/pushTask", () => {
	return function pushTask() {
		mockIsTaskPushed = true;
	};
});

jest.mock("../../../../../core/admin/async_task/wonde/syncUserData/processUsersForSchool", () => {
	return async function pushTask(querier, wondeIdentifier, schoolId) {
		mockProcessUsersForSchool.push({
			wonde: wondeIdentifier,
			id: schoolId,
		});
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockIsTaskPushed = false;
	mockProcessUsersForSchool = [];
	mockQuery = () => {};
	mockIsTaskDeleted = false;
	const doQuery = (t, v) => {
		let text;
		let values;
		if (typeof t === "string") {
			text = t;
			values = v || [];
		} else {
			text = t.text;
			values = t.values;
		}
		text = text.replace(/\s+/g, " ");
		return mockQuery(text, values);
	};
	mockTaskDetail = {
		getAppDbPool() {
			return {
				query(t, v) {
					return doQuery(t, v);
				},
			};
		},
		async query(t, v) {
			return doQuery(t, v);
		},
		async deleteSelf() {
			mockIsTaskDeleted = true;
		},
	};
	mockIsIncludeDateEdited = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

const c = (str) => str.trim().replace(/[\s\t\n\r]+/g, " ");

test(`No schools`, async () => {
	mockQuery = async () => {
		return {
			rows: [],
			rowCount: 0,
		};
	};
	await syncWondeUserData(mockTaskDetail);
	expect(mockProcessUsersForSchool).toEqual([]);
	expect(mockIsTaskDeleted).toBe(true);
	expect(mockIsTaskPushed).toBe(true);
});

test(`Some schools`, async () => {
	let didUpdate = false;
	mockQuery = async (text, values) => {
		if (text.indexOf("SELECT ") !== -1) {
			return {
				rowCount: 2,
				rows: [
					{
						id: 100,
						wonde_identifier: "w1",
					},
					{
						id: 200,
						wonde_identifier: "w2",
					},
				],
			};
		}
		if (
			text ===
			c(`
			UPDATE
				school
			SET
				date_last_wonde_user_synced = NOW(),
				date_edited = NOW()
			WHERE
				id IN (100, 200)
		`)
		) {
			didUpdate = true;
		}
		return {
			rows: [],
			rowCount: 0,
		};
	};
	await syncWondeUserData(mockTaskDetail);
	expect(mockProcessUsersForSchool).toEqual([
		{
			wonde: "w1",
			id: 100,
		},
		{
			wonde: "w2",
			id: 200,
		},
	]);
	expect(didUpdate).toBe(true);
	expect(mockIsTaskDeleted).toBe(true);
	expect(mockIsTaskPushed).toBe(true);
});

test(`Ensure date_edited updated successfully in database`, async () => {
	let didUpdate = false;
	mockQuery = async (text, values) => {
		if (text.indexOf("SELECT ") !== -1) {
			return {
				rowCount: 2,
				rows: [
					{
						id: 100,
						wonde_identifier: "w1",
					},
					{
						id: 200,
						wonde_identifier: "w2",
					},
				],
			};
		}
		if (
			text ===
			c(`
			UPDATE
				school
			SET
				date_last_wonde_user_synced = NOW(),
				date_edited = NOW()
			WHERE
				id IN (100, 200)
		`)
		) {
			mockIsIncludeDateEdited = text.indexOf(`date_edited`) !== -1 ? true : false;
			didUpdate = true;
		}
		return {
			rows: [],
			rowCount: 0,
		};
	};
	await syncWondeUserData(mockTaskDetail);
	expect(mockProcessUsersForSchool).toEqual([
		{
			wonde: "w1",
			id: 100,
		},
		{
			wonde: "w2",
			id: 200,
		},
	]);
	expect(didUpdate).toBe(true);
	expect(mockIsTaskDeleted).toBe(true);
	expect(mockIsTaskPushed).toBe(true);
	expect(mockIsIncludeDateEdited).toBe(true);
});
