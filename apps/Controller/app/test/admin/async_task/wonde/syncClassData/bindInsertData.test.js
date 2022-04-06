const bindInsertDataRaw = require("../../../../../core/admin/async_task/wonde/syncClassData/bindInsertData");
let mockData = [];
let mockSchoolId;
let mockIsIncludeDateEditedOnConflict;

/**
 * tvf-util
 */
jest.mock("#tvf-util", () => {
	const tvfUtil = {
		generateObjectIdentifier: async () => "XXXYYYZZZ",
	};
	return tvfUtil;
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockData = [
		{
			id: "id1",
			mis_id: "mis1",
			title: "title 1",
			year_group: "y12a",
		},
		{
			id: "id2",
			mis_id: "mis2",
			title: "title 2",
			year_group: "y12b",
		},
	];
	mockSchoolId = 12345;
	mockIsIncludeDateEditedOnConflict = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function bindInsertData() {
	let err = null;
	try {
		result = await bindInsertDataRaw(mockData, mockSchoolId);
		return result;
	} catch (e) {
		err = e;
	}
	return err;
}

const c = (str) => str.trim().replace(/[\s\t\n\r]+/g, " ");

test(`Function render correctly`, async () => {
	const result = await bindInsertData();
	expect(c(result.query)).toEqual(
		c(`
		INSERT INTO
			course
			(
				title,
				year_group,
				school_id,
				oid,
				wonde_identifier,
				wonde_mis_id,
				creator_id
			)
		VALUES
			(
				$1,
				$2,
				$3,
				$4,
				$5,
				$6,
				0
			),
			(
				$7,
				$8,
				$9,
				$10,
				$11,
				$12,
				0
			)
		ON CONFLICT
			(wonde_identifier)
			WHERE archive_date IS NULL
		DO UPDATE SET
			title = EXCLUDED.title,
			year_group = EXCLUDED.year_group,
			date_edited = NOW()
	`)
	);
	expect(result.binds).toEqual([
		"title 1",
		"y12a",
		mockSchoolId,
		"XXXYYYZZZ",
		"id1",
		"mis1",

		"title 2",
		"y12b",
		mockSchoolId,
		"XXXYYYZZZ",
		"id2",
		"mis2",
	]);
});

test(`Ensure when conflict occurs, date_edited is updated successfully in database`, async () => {
	const result = await bindInsertData();
	const query = c(result.query);
	if (query.indexOf("INSERT INTO course") !== -1) {
		if (query.indexOf("ON CONFLICT (wonde_identifier) WHERE archive_date IS NULL DO UPDATE") !== -1) {
			mockIsIncludeDateEditedOnConflict = query.indexOf("date_edited") !== -1 ? true : false;
		}
	}
	expect(result.binds).toEqual([
		"title 1",
		"y12a",
		mockSchoolId,
		"XXXYYYZZZ",
		"id1",
		"mis1",

		"title 2",
		"y12b",
		mockSchoolId,
		"XXXYYYZZZ",
		"id2",
		"mis2",
	]);
	expect(mockIsIncludeDateEditedOnConflict).toBe(true);
});
