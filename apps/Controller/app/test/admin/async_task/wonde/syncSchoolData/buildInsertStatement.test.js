const buildInsertStatement = require("../../../../../core/admin/async_task/wonde/syncSchoolData/buildInsertStatement");
let mockRows = [];
let mockIsIncludeDateEditedOnConflict;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockRows = [
		{
			id: "A1329183371",
			name: "Wonde School 1",
			urn: 100000,
			la_code: "201",
			mis: "ScholarPack",
			address_postcode: "EC3A 5DE",
			address_line_1: "Address line 1",
			address_line_2: "Address line 2",
			address_town: "City1",
			school_level: "high",
			approved: true,
			identifier: "///100000/",
			domain: "api.wonde.com",
			school_url: "https://api.wonde1.com/v1.0/schools/A1329183376",
			enable_wonde_user_sync: true,
			enable_wonde_class_sync: true,
			territory: "england",
		},
		{
			id: "A1329183372",
			name: "Wonde School 2",
			urn: 100001,
			la_code: "201",
			mis: "ScholarPack",
			address_postcode: "EC3A 5DE",
			address_line_1: "Address line 1",
			address_line_2: "Address line 2",
			address_town: "City1",
			school_level: "high",
			approved: true,
			identifier: "///100001/",
			domain: "api.wonde.com",
			school_url: "https://api.wonde2.com/v1.0/schools/A1329183376",
			enable_wonde_user_sync: true,
			enable_wonde_class_sync: true,
			territory: "england",
		},
	];
	mockIsIncludeDateEditedOnConflict = false;
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

test(`Function render correctly`, () => {
	mockRows = [];
	const result = buildInsertStatement(mockRows);
	expect(result.query).not.toEqual(null);
	expect(result.binds).toEqual([]);
});

test(`Function return the insert statement with query and binds`, () => {
	const result = buildInsertStatement(mockRows);
	expect(result.query).not.toEqual(null);
	expect(result.binds.length).toEqual(24);
});

test(`Ensure when conflict occurs, date_edited is updated successfully in database`, () => {
	const result = buildInsertStatement(mockRows);
	const query = result.query.replace(/\s+/g, " ");
	if (query.indexOf("INSERT INTO school") !== -1) {
		if (query.indexOf("ON CONFLICT (wonde_identifier) DO UPDATE") !== -1) {
			mockIsIncludeDateEditedOnConflict = query.indexOf("date_edited") !== -1 ? true : false;
		}
	}
	expect(result.query).not.toEqual(null);
	expect(result.binds.length).toEqual(24);
	expect(mockIsIncludeDateEditedOnConflict).toBe(true);
});
