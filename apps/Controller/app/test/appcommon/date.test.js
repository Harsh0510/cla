const { sqlToJsTimestamp, jsDateToNiceFormat, sqlToNiceFormat, rawToNiceDate, rawToNiceDateForExcel } = require("../../common/date");
let mockDate, academicYearEndMonth, academicYearEndDay;
//jest.mock('moment', () => () => ({format: () => '2018–01–30T12:34:56+00:00'}));
const moment = jest.mock("moment", () => {
	const moment = require.requireActual("moment-timezone");
	return moment;
});

function resetAll() {
	mockDate = "";
	academicYearEndMonth = "";
	academicYearEndDay = "";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`return the object with key value pair`, async () => {
	const item = sqlToJsTimestamp("2018-11-11T11:13:20.584Z");
	expect(item).toEqual(1541934800584);
});

test(`return the date in nice format`, async () => {
	const item = jsDateToNiceFormat(new Date("2018-11-11T11:13:20.584Z"));
	expect(item).toEqual("11/11/2018");
});

/** rawToNiceDate start here */
test("rawToNiceDate: function load with actual date", async () => {
	mockDate = "2018-11-11T11:13:20.584Z";
	const item = rawToNiceDate(mockDate);
	expect(item).toEqual("11 November 2018");
});

test("rawToNiceDate: function load with empty date", async () => {
	mockDate = "";
	const item = rawToNiceDate(mockDate);
	expect(item).toEqual(null);
});

test("rawToNiceDate: function load with non-string date", async () => {
	const today = new Date();
	const date = today.getDate();
	const year = today.getFullYear();
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const month = months[today.getMonth()];
	mockDate = [];
	const item = rawToNiceDate(mockDate);
	const result = date + " " + month + " " + year;
	expect(item).toEqual(result);
});

/** sqlToNiceFormat start here */

/** sqlToNiceFormat: function load with actual date */
test("sqlToNiceFormat: function load with actual date", async () => {
	mockDate = "2018-11-11T11:13:20.584Z";
	const item = sqlToNiceFormat(mockDate);
	expect(item).toEqual("11/11/2018");
});

/** sqlToNiceFormat: function load with actual date it return's NaN*/
test("sqlToNiceFormat: function load with empty date", async () => {
	mockDate = "";
	const item = sqlToNiceFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN");
});

/** sqlToNiceFormat: function load with only date wihtout time*/
test("sqlToNiceFormat: function load with only date", async () => {
	mockDate = "2018-11-11";
	const item = sqlToNiceFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN");
});

/** sqlToNiceFormat: function load with only date wihtout time*/
test("sqlToNiceFormat: function load with only time", async () => {
	mockDate = "11:13:20.584Z";
	const item = sqlToNiceFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN");
});

/** sqlToNiceFormat: function load with diffrent date formate*/
test("sqlToNiceFormat: function load with diffrent date formate", async () => {
	mockDate = "03/25/201511:13:20.584Z";
	const item = sqlToNiceFormat(mockDate);
	expect(item).toEqual("18/09/2456");
});

test("sqlToNiceFormat: function load with day or month value without 0", async () => {
	mockDate = "2018-1-1T11:13:20.584Z";
	const item = sqlToNiceFormat(mockDate);
	expect(item).toEqual("01/01/2018");
});
/** sqlToNiceFormat end here */

test(`rawToNiceDateForExcel`, async () => {
	mockDate = "2018-1-1T11:13:20.584Z";
	const item = rawToNiceDateForExcel(mockDate);
	expect(item).toBe("2018-01-01 11:13:20");
});

test(`rawToNiceDateForExcel: function load with empty date`, async () => {
	const item = rawToNiceDateForExcel("");
	expect(item).toBe(null);
});
