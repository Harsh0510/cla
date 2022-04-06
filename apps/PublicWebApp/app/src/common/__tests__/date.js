import "../../mocks/MockNavigator.js";
import date from "./../date";

const moment = require("moment");

let mockDate, academicYearEndMonth, academicYearEndDay;

function resetAll() {
	mockDate = "";
	academicYearEndMonth = "";
	academicYearEndDay = "";
}

beforeEach(resetAll);
afterEach(resetAll);

/** rawToNiceDate start here */
test("rawToNiceDate: function load with actual date", async () => {
	mockDate = "2018-11-11T11:13:20.584Z";
	const item = date.rawToNiceDate(mockDate);
	expect(item).toEqual("11 November 2018");
});

test("rawToNiceDate: function load with empty date", async () => {
	mockDate = "";
	const item = date.rawToNiceDate(mockDate);
	expect(item).toEqual(null);
});

test("rawToNiceDate: function load with array", async () => {
	mockDate = [];
	const item = date.rawToNiceDate(mockDate);
	const currentMomDate = moment.utc(date).format("D MMMM YYYY");
	expect(item).toEqual(currentMomDate);
});

/** rawToNiceDate end here */

/** sqlToNiceFormat start here */

/** sqlToNiceFormat: function load with actual date */
test("sqlToNiceFormat: function load with actual date", async () => {
	mockDate = "2018-11-11T11:13:20.584Z";
	const item = date.sqlToNiceFormat(mockDate);
	expect(item).toEqual("11/11/2018");
});

/** sqlToNiceFormat: function load with actual date it return's NaN*/
test("sqlToNiceFormat: function load with empty date", async () => {
	mockDate = "";
	const item = date.sqlToNiceFormat(mockDate);
	expect(item).toEqual(null);
});

/** sqlToNiceFormat: function load with only date wihtout time*/
test("sqlToNiceFormat: function load with only date", async () => {
	mockDate = "2018-11-11";
	const item = date.sqlToNiceFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN");
});

/** sqlToNiceFormat: function load with only date wihtout time*/
test("sqlToNiceFormat: function load with only time", async () => {
	mockDate = "11:13:20.584Z";
	const item = date.sqlToNiceFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN");
});

/** sqlToNiceFormat: function load with diffrent date formate*/
test("sqlToNiceFormat: function load with diffrent date formate", async () => {
	mockDate = "03/25/201511:13:20.584Z";
	const item = date.sqlToNiceFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN");
});

test("sqlToNiceFormat: function load with diffrent date formate", async () => {
	mockDate = "03/25/201511:13:20.584Z";
	const item = date.sqlToNiceFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN");
});

test("sqlToNiceFormat: function load with day or month value without 0", async () => {
	mockDate = "2018-1-1T11:13:20.584Z";
	const item = date.sqlToNiceFormat(mockDate);
	expect(item).toEqual("01/01/2018");
});
/** sqlToNiceFormat end here */

/** sqlToNiceDateTimeFormat start here */

/** sqlToNiceDateTimeFormat: function load with actual date */
test("sqlToNiceDateTimeFormat: function load with actual date", async () => {
	mockDate = "2018-11-11T11:13:20.584Z";
	const item = date.sqlToNiceDateTimeFormat(mockDate);
	expect(item).toEqual("11/11/2018 11:13");
});

/** sqlToNiceDateTimeFormat: function load with actual date it return's NaN*/
test("sqlToNiceDateTimeFormat: function load with empty date", async () => {
	mockDate = "";
	const item = date.sqlToNiceDateTimeFormat(mockDate);
	expect(item).toEqual(null);
});

/** sqlToNiceDateTimeFormat: function load with only date wihtout time*/
test("sqlToNiceDateTimeFormat: function load with only date", async () => {
	mockDate = "2018-11-11";
	const item = date.sqlToNiceDateTimeFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN NaN:NaN");
});

/** sqlToNiceDateTimeFormat: function load with only date wihtout time*/
test("sqlToNiceDateTimeFormat: function load with only time", async () => {
	mockDate = "11:13:20.584Z";
	const item = date.sqlToNiceDateTimeFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN NaN:NaN");
});

/** sqlToNiceDateTimeFormat: function load with diffrent date formate*/
test("sqlToNiceDateTimeFormat: function load with diffrent date formate", async () => {
	mockDate = "03/25/201511:13:20.584Z";
	const item = date.sqlToNiceDateTimeFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN NaN:NaN");
});

test("sqlToNiceDateTimeFormat: function load with diffrent date formate", async () => {
	mockDate = "03/25/201511:13:20.584Z";
	const item = date.sqlToNiceDateTimeFormat(mockDate);
	expect(item).toEqual("NaN/NaN/NaN NaN:NaN");
});

test("sqlToNiceDateTimeFormat: function load with day or month value without 0", async () => {
	mockDate = "2018-1-1T11:13:20.584Z";
	const item = date.sqlToNiceDateTimeFormat(mockDate);
	expect(item).toEqual("01/01/2018 11:13");
});
/** sqlToNiceDateTimeFormat end here */

test("timeDifferences from time stamp", async () => {
	let date_created = new Date();
	date_created.setDate(date_created.getDate() - 1);
	let timeStamp = date_created.toISOString();
	const item = date.timeDifferences(timeStamp);
	expect(item.weekDiff).toEqual(0);
	expect(item.hourDiff).not.toBe(0);
	expect(item.dayDiff).toBe(1);
});

test(`rawToNiceDateForExcel`, async () => {
	mockDate = "2018-1-1T11:13:20.584Z";
	const item = date.rawToNiceDateForExcel(mockDate);
	expect(item).toBe("2018-01-01 11:13:20");
});

test(`rawToNiceDateForExcel data null`, async () => {
	mockDate = "";
	const item = date.rawToNiceDateForExcel(mockDate);
	expect(item).toBeNull();
});

test(`rawToNiceDateForExcel passing date `, async () => {
	mockDate = "2018-1-1T11:13:20.584Z";
	const item = date.rawToNiceDateForExcel(mockDate);
	expect(item).toBe("2018-01-01 11:13:20");
});

test(`sqlToFullMonthYearFormat`, async () => {
	mockDate = "2018-1-1T11:13:20.584Z";
	const item = date.sqlToFullMonthYearFormat(mockDate);
	expect(item).toBe("January 2018");
});

test(`sqlToFullMonthYearFormat data null`, async () => {
	mockDate = "";
	const item = date.sqlToFullMonthYearFormat(mockDate);
	expect(item).toBeNull();
});

test(`sqlToFullMonthYearFormat passing date `, async () => {
	mockDate = "2018-1-1T11:13:20.584Z";
	const item = date.sqlToFullMonthYearFormat(mockDate);
	expect(item).toBe("January 2018");
});

/** sqlToNiceDateWithTimeFormat start here */

/** sqlToNiceDateWithTimeFormat: function load with actual date */
test("sqlToNiceDateWithTimeFormat: function load with actual date", async () => {
	mockDate = new Date("2018-11-11T11:13:20.584+00:00");
	var isoDate = new Date(mockDate.getTime() + mockDate.getTimezoneOffset() * 60000).toISOString();
	const item = date.sqlToNiceDateWithTimeFormat(isoDate);
	expect(item).toEqual("11/11/2018 11:13:20");
});

/** sqlToNiceDateWithTimeFormat: function load with actual date it return's NaN*/
test("sqlToNiceDateWithTimeFormat: function load with empty date", async () => {
	mockDate = "";
	const item = date.sqlToNiceDateWithTimeFormat(mockDate);
	expect(item).toEqual(null);
});

/** sqlToNiceDateWithTimeFormat: function load with only date wihtout time*/
test("sqlToNiceDateWithTimeFormat: function load with only date", async () => {
	mockDate = "2018-11-11";
	const item = date.sqlToNiceDateWithTimeFormat(mockDate);
	expect(item).toEqual("Invalid date");
});

/** sqlToNiceDateWithTimeFormat: function load with only date wihtout time*/
test("sqlToNiceDateWithTimeFormat: function load with only time", async () => {
	mockDate = "11:13:20.584Z";
	const item = date.sqlToNiceDateWithTimeFormat(mockDate);
	expect(item).toEqual("Invalid date");
});

/** sqlToNiceDateWithTimeFormat: function load with diffrent date formate*/
test("sqlToNiceDateWithTimeFormat: function load with diffrent date formate", async () => {
	mockDate = "03/25/201511:13:20.584Z";
	const item = date.sqlToNiceDateWithTimeFormat(mockDate);
	expect(item).toEqual("Invalid date");
});

test("sqlToNiceDateWithTimeFormat: function load with diffrent date formate", async () => {
	mockDate = "03/25/201511:13:20.584Z";
	const item = date.sqlToNiceDateWithTimeFormat(mockDate);
	expect(item).toEqual("Invalid date");
});
/** sqlToNiceDateWithTimeFormat end here */

/** getEncodedDate start here */

/** getEncodedDate: function load with actual date */
test("getEncodedDate: function load with actual date", async () => {
	mockDate = new Date("2018-11-11T11:13:20.584+00:00");
	const item = date.getEncodedDate(mockDate);
	expect(item).toEqual(1541934800);
});

/** getEncodedDate: function load with actual date it return's NaN*/
test("getEncodedDate: function load with empty date", async () => {
	mockDate = "";
	const item = date.getEncodedDate(mockDate);
	expect(item).toEqual(null);
});

// /** getEncodedDate end here */

/** getDecodedDate start here */

/** getDecodedDate: function load with actual date */
test("getDecodedDate: function load with actual date", async () => {
	const v = 1626719400;
	const item = date.getDecodedDate(v);
	expect(item.getTime()).toBe(v * 1000);
});

test("getDecodedDate: function load with actual date", async () => {
	mockDate = "1626719400";
	const item = date.getDecodedDate(mockDate);
	expect(item).toBe("1626719400");
});

/** getDecodedDate: function load with actual date it return's NaN*/
test("getDecodedDate: function load with empty date", async () => {
	mockDate = "";
	const item = date.getDecodedDate(mockDate);
	expect(item).toEqual(null);
});

/** getDecodedDate end here */
