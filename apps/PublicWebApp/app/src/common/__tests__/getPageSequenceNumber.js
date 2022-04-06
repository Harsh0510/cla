import getPageSequenceNumber from "../../common/getPageSequenceNumber";

let value, page_offset_roman, page_offset_arabic;
let mockResult;

function resetAll() {
	value = "10";
	page_offset_roman = 0;
	page_offset_arabic = 0;
	mockResult = 0;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`When value pass with '10', page_offset_roman with 0, page_offset_arabic with 0 and return value with 10`, async () => {
	value = "10";
	page_offset_arabic = 0;
	page_offset_roman = 0;
	mockResult = 10;
	const item = getPageSequenceNumber(value, page_offset_roman, page_offset_arabic);
	expect(item).toEqual(mockResult);
});

test(`When value pass with '[10]', page_offset_roman with 0, page_offset_arabic with 0 and return value with 10`, async () => {
	value = "[10]";
	page_offset_arabic = 0;
	page_offset_roman = 0;
	mockResult = 10;
	const item = getPageSequenceNumber(value, page_offset_roman, page_offset_arabic);
	expect(item).toEqual(mockResult);
});

test(`When value pass with '[5]', page_offset_roman with 0, page_offset_arabic with 0 and return value with 10`, async () => {
	value = "[5]";
	page_offset_roman = 6;
	page_offset_arabic = 10;
	mockResult = 5;
	const item = getPageSequenceNumber(value, page_offset_roman, page_offset_arabic);
	expect(item).toEqual(mockResult);
});

test(`When value pass with '[5]', page_offset_roman with 0, page_offset_arabic with 0 and return value with 10`, async () => {
	value = "i";
	page_offset_roman = 6;
	page_offset_arabic = 10;
	mockResult = 7;
	const item = getPageSequenceNumber(value, page_offset_roman, page_offset_arabic);
	expect(item).toEqual(mockResult);
});

test(`When value pass with '10', page_offset_roman with 0, page_offset_arabic with 0 and return value with 10`, async () => {
	value = "10";
	page_offset_roman = 6;
	page_offset_arabic = 10;
	mockResult = 20;
	const item = getPageSequenceNumber(value, page_offset_roman, page_offset_arabic);
	expect(item).toEqual(mockResult);
});

test(`When value pass with 'abc', page_offset_roman with 0, page_offset_arabic with 0 and return value with 10`, async () => {
	value = "abc";
	page_offset_roman = 6;
	page_offset_arabic = 10;
	mockResult = 0;
	const item = getPageSequenceNumber(value, page_offset_roman, page_offset_arabic);
	expect(item).toEqual(mockResult);
});

test(`When value pass as integer, page_offset_roman with 0, page_offset_arabic with 6 and return value with 10`, async () => {
	value = 8;
	page_offset_roman = 6;
	page_offset_arabic = 10;
	mockResult = 0;
	const item = getPageSequenceNumber(value, page_offset_roman, page_offset_arabic);
	expect(item).toEqual(18);
});

test(`When value pass as null, page_offset_roman with 0, page_offset_arabic with 6 and return value with 10`, async () => {
	value = null;
	page_offset_roman = 6;
	page_offset_arabic = 10;
	mockResult = 0;
	const item = getPageSequenceNumber(value, page_offset_roman, page_offset_arabic);
	expect(item).toEqual(0);
});
