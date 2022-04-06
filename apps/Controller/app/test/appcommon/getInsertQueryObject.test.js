const getInsertQueryObject = require("../../common/getInsertQueryObject");

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

test(`Return a query object with query`, async () => {
	const item = getInsertQueryObject(mockTableName, mockFields, mockData, mockOnClonflict);
	expect(item.text).toEqual("INSERT INTO Table1 (fields1, fields2) VALUES ($1, $2) ");
	expect(item.values).toEqual(["t1", "test"]);
});

test(`Return null when no data`, async () => {
	const item = getInsertQueryObject();
	expect(item).toEqual(null);
});
