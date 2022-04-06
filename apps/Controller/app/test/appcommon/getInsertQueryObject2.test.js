const getInsertQueryObject2 = require("../../common/getInsertQueryObject2");

let mockTableName, mockFields, mockData, mockOnClonflict;

function resetAll() {
	mockTableName = "Table1";
	mockFields = ["fields1", "fields2"];
	mockData = [
		{
			fields1: "t1",
			fields2: "test",
		},
	];
	mockOnClonflict = null;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return a query when have data`, async () => {
	const item = getInsertQueryObject2(mockTableName, mockFields, mockData, mockOnClonflict);
	expect(item.text).toEqual("INSERT INTO Table1 (fields1, fields2) VALUES ($1, $2) ");
	expect(item.values).toEqual(["t1", "test"]);
});

test(`Return null when no data`, async () => {
	mockData = [];
	const item = getInsertQueryObject2(mockTableName, mockFields, mockData, mockOnClonflict);
	expect(item).toEqual(null);
});

test(`Return a query with default value when data not match with feilds`, async () => {
	mockFields = ["fields3", "fields4"];
	const item = getInsertQueryObject2(mockTableName, mockFields, mockData, mockOnClonflict);
	expect(item.text).toEqual("INSERT INTO Table1 (fields3, fields4) VALUES (DEFAULT, DEFAULT) ");
});

test(`Return a query when no feilds`, async () => {
	mockFields = [];
	const item = getInsertQueryObject2(mockTableName, mockFields, mockData, mockOnClonflict);
	expect(item.text).toEqual("INSERT INTO Table1 () VALUES () ");
});
