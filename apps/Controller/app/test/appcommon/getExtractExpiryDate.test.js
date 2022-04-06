const getExtractExpiryDate = require("../../common/getExtractExpiryDate");

let currentDate, mockResultDate, mockAcademicYearEndMonth, mockAcademicYearEndDay;

function resetAll() {
	mockResultDate = new Date(2019, 6, 31, 23, 59, 59, 999);
	mockAcademicYearEndMonth = 7;
	mockAcademicYearEndDay = 31;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return expiry date of 31'st july`, async () => {
	currentDate = new Date(2019, 5, 25, 10, 55, 0, 0);
	const item = getExtractExpiryDate(currentDate, mockAcademicYearEndMonth, mockAcademicYearEndDay);
	expect(item).toEqual(mockResultDate);
});

test(`When creating copy on 30th July it should expire next day`, () => {
	mockResultDate = new Date(2020, 6, 31, 23, 59, 59, 999);
	currentDate = new Date(2020, 6, 30, 23, 59, 59, 999);
	const item = getExtractExpiryDate(currentDate, mockAcademicYearEndMonth, mockAcademicYearEndDay);
	expect(item).toEqual(mockResultDate);
});

test(`When creating copy on 31st July it should expire next year`, async () => {
	mockResultDate = new Date(2021, 6, 31, 23, 59, 59, 999);
	currentDate = new Date(2020, 6, 31, 22, 59, 59, 999);
	const item = getExtractExpiryDate(currentDate, mockAcademicYearEndMonth, mockAcademicYearEndDay);
	expect(item).toEqual(mockResultDate);
});

test(`When creating copy on 1st Jan it should expire 31st July same year`, async () => {
	mockResultDate = new Date(2021, 6, 31, 23, 59, 59, 999);
	currentDate = new Date(2021, 0, 1, 22, 59, 59, 999);
	const item = getExtractExpiryDate(currentDate, mockAcademicYearEndMonth, mockAcademicYearEndDay);
	expect(item).toEqual(mockResultDate);
});

test(`When academic_year_end_day=15 and academic_year_end_month=8`, async () => {
	mockAcademicYearEndMonth = 8;
	mockAcademicYearEndDay = 15;
	mockResultDate = new Date(2021, 7, 15, 23, 59, 59, 999);
	currentDate = new Date(2021, 0, 1, 22, 59, 59, 999);
	const item = getExtractExpiryDate(currentDate, mockAcademicYearEndMonth, mockAcademicYearEndDay);
	expect(item).toEqual(mockResultDate);
});
