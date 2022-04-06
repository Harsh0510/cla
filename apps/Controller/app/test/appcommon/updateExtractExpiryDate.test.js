const updateExtractExpiryDate = require("../../common/updateExtractExpiryDate");

jest.mock("../../common/getExtractExpiryDate", () => {
	return function () {
		return "2021-07-31 23:59:59.999999+00";
	};
});
let mockExtractData, mockIsFecthExtractExecute, mockIsUpdateExtract;
let mockIsIncludeDateEdited;
let mockIsIncludeModifyUserId;

const client = {
	query: async (psql, data) => {
		psqlQuery = psql.replace(/\s+/g, " ");
		if (psqlQuery.indexOf("SELECT id AS extract_id, date_created AS date_created") !== -1) {
			mockIsFecthExtractExecute = true;
			return mockExtractData;
		} else if (psqlQuery.indexOf("UPDATE extract") !== -1) {
			mockIsUpdateExtract = true;
			return {};
		}
	},
};

function resetAll() {
	mockExtractData = { rows: [{ extract_id: 1, date_created: "2021-03-30 14:50:21.966348+00" }] };
	mockIsFecthExtractExecute = false;
	mockIsUpdateExtract = false;
	mockIsIncludeDateEdited = false;
	mockIsIncludeModifyUserId = false;
}

beforeEach(resetAll);
afterEach(resetAll);

test("Function render correctly", async () => {
	await updateExtractExpiryDate(client, 1, 1, 7, 31);
	expect(mockIsFecthExtractExecute).toBe(true);
	expect(mockIsUpdateExtract).toBe(true);
});

test("Function render correctly when no extract found", async () => {
	mockExtractData = { row: [] };
	await updateExtractExpiryDate(client, 1, 1, 7, 31);
	expect(mockIsFecthExtractExecute).toBe(true);
	expect(mockIsUpdateExtract).toBe(false);
});

test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
	client.query = (psql, data) => {
		psqlQuery = psql.replace(/\s+/g, " ");
		if (psqlQuery.indexOf("SELECT id AS extract_id, date_created AS date_created") !== -1) {
			mockIsFecthExtractExecute = true;
			return mockExtractData;
		} else if (psqlQuery.indexOf("UPDATE extract SET") !== -1) {
			mockIsUpdateExtract = true;
			mockIsIncludeModifyUserId = psqlQuery.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = psqlQuery.indexOf("date_edited") !== -1 ? true : false;
			return {};
		}
	};
	await updateExtractExpiryDate(client, 1, 1, 7, 31);
	expect(mockIsFecthExtractExecute).toBe(true);
	expect(mockIsUpdateExtract).toBe(true);
	expect(mockIsIncludeDateEdited).toBe(true);
	expect(mockIsIncludeModifyUserId).toBe(true);
});
