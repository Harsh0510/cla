const exportExtractAccessData = require("../../common/exportExtractAccessData");

let mockData = [];

function resetAll() {
	mockData = [
		{
			extract_id: 245,
			asset_id: 20,
			isbn13: "9780008144678",
			asset_name: "The Shanghai Maths Project Practice Book Year 6: For the English National Curriculum (Shanghai Maths)",
			extract_title: "test",
			creator_school_id: 4,
			creator_school_name: "Ernest Shackleton Memorial (CLA) High School",
			accessor_school_id: 4,
			accessor_school_name: "Ernest Shackleton Memorial (CLA) High School",
			ip_address: "::ffff:172.18.0.1",
			user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
			date_created: "2019-08-21T11:01:48.578Z",
		},
		{
			extract_id: 245,
			asset_id: 20,
			isbn13: "9780008144678",
			asset_name: "The Shanghai Maths Project Practice Book Year 6: For the English National Curriculum (Shanghai Maths)",
			extract_title: "test",
			creator_school_id: 4,
			creator_school_name: "Ernest Shackleton Memorial (CLA) High School",
			accessor_school_id: 4,
			accessor_school_name: "Ernest Shackleton Memorial (CLA) High School",
			ip_address: "::ffff:172.18.0.1",
			user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36",
			date_created: "2019-08-21T11:01:51.243Z",
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

test(`generate export data when have data`, async () => {
	const result = exportExtractAccessData(mockData);
	expect(result[0]).toHaveProperty("Asset DB ID");
	expect(result[0]).toHaveProperty("Asset Print ISBN");
	expect(result[0]).toHaveProperty("Asset Name");
	expect(result[0]).toHaveProperty("Extract Title");
	expect(result[0]).toHaveProperty("Creator Institution ID");
	expect(result[0]).toHaveProperty("Creator Institution Name");
	expect(result[0]).toHaveProperty("Accessor Institution ID");
	expect(result[0]).toHaveProperty("Accessor Institution Name");
	expect(result[0]).toHaveProperty("IP Address");
	expect(result[0]).toHaveProperty("User Agent");
	expect(result[0]).toHaveProperty("Access Date");
});

test(`generate export data when data is blank`, async () => {
	mockData = [];
	const result = exportExtractAccessData(mockData);
	expect(result[0]).toHaveProperty("Asset DB ID");
	expect(result[0]).toHaveProperty("Asset Print ISBN");
	expect(result[0]).toHaveProperty("Asset Name");
	expect(result[0]).toHaveProperty("Extract Title");
	expect(result[0]).toHaveProperty("Creator Institution ID");
	expect(result[0]).toHaveProperty("Creator Institution Name");
	expect(result[0]).toHaveProperty("Accessor Institution ID");
	expect(result[0]).toHaveProperty("Accessor Institution Name");
	expect(result[0]).toHaveProperty("IP Address");
	expect(result[0]).toHaveProperty("User Agent");
	expect(result[0]).toHaveProperty("Access Date");
});
