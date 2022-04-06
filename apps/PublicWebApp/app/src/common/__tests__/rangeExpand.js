import { rangeExpand } from "../../common/rangeExpand";

let mockRaw, mockResult;
let rangeExpr,
	page_offset_arabic = 0,
	page_offset_roman = 0,
	pageCount = 0;
function resetAll() {
	mockResult = [];
	mockRaw = "1,2,3";
	page_offset_arabic = 0;
	page_offset_roman = 0;
	pageCount = 130;
}

beforeEach(resetAll);
afterEach(resetAll);

/** When string pass with 'special charcter and alphabetic' and return array value with 0 */
test(`When string pass with 'special charcter and alphabetic', page_offset_arabic with 0, page_offset_roman with 0, page_count with 130 and return array value with 0`, async () => {
	mockRaw = "foo, 1, @foo1";
	page_offset_arabic = 0;
	page_offset_roman = 0;
	pageCount = 130;
	mockResult = [0, 1, 0];
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

/** When string pass '10, 20, 1-5' and return array value */
test(`When string pass with '10, 20, 1-5', page_offset_arabic with 0, page_offset_roman with 0, page_count with 130 and return array with range value`, async () => {
	mockRaw = "10, 20, 1-5";
	mockResult = [10, 20, 1, 2, 3, 4, 5];
	page_offset_arabic = 0;
	page_offset_roman = 0;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

/** When string pass massive range and return array value */
test(`When string pass massive range and return array with 0 value`, async () => {
	mockRaw = "5-1";
	mockResult = [0];
	page_offset_arabic = 0;
	page_offset_roman = 0;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

/** When string pass singe digit value and return array value */
test(`When string pass singe digit value and return array with range and 0 value`, async () => {
	mockRaw = "0-2, 1-0";
	mockResult = [0, 1, 2, 0];
	page_offset_arabic = 0;
	page_offset_roman = 0;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

/** When string pass with ',' operator and return array value */
test(`When string pass with ',' operator and return array with [1, 2] value`, async () => {
	mockRaw = "1, 2";
	mockResult = [1, 2];
	page_offset_arabic = 0;
	page_offset_roman = 0;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with '[1]', page_offset_roman with 2, page_offset_arabic with 4, page_count with 130 and return array with range value `, async () => {
	mockRaw = "[1]";
	mockResult = [1];
	page_offset_roman = 2;
	page_offset_arabic = 4;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with '1-4,6,9', page_offset_roman with 2, page_offset_arabic with 4, page_count with 130 and return array with range value [1,2,3,4,6,9]`, async () => {
	mockRaw = "1-4,6,9";
	mockResult = [1, 2, 3, 4, 6, 9];
	page_offset_roman = 2;
	page_offset_arabic = 4;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with '[4], iii', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [0, 0]`, async () => {
	mockRaw = "[4], iii";
	mockResult = [0, 0];
	page_offset_roman = 2;
	page_offset_arabic = 2;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with 'iii', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [0]`, async () => {
	mockRaw = "iii";
	mockResult = [0];
	page_offset_roman = 2;
	page_offset_arabic = 2;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with 'iii', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [3]`, async () => {
	mockRaw = "iii";
	mockResult = [3];
	page_offset_roman = 2;
	page_offset_arabic = 6;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with 'iii', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [0]`, async () => {
	mockRaw = "130";
	mockResult = [0];
	page_offset_roman = 2;
	page_offset_arabic = 6;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with '[1]-iii', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [1,2,3]`, async () => {
	mockRaw = "[1]-iii";
	mockResult = [1, 2, 3];
	page_offset_roman = 2;
	page_offset_arabic = 6;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with '[5]-iii', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [0,1,2,3]`, async () => {
	mockRaw = "[5]-iii";
	mockResult = [0, 1, 2, 3];
	page_offset_roman = 2;
	page_offset_arabic = 6;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with 'i-vii', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [0]`, async () => {
	mockRaw = "i-vii";
	mockResult = [0];
	page_offset_roman = 2;
	page_offset_arabic = 6;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with 'iv-vii', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [0]`, async () => {
	mockRaw = "iv-vii";
	mockResult = [0];
	page_offset_roman = 2;
	page_offset_arabic = 2;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with '135-140', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [0]`, async () => {
	mockRaw = "135-140";
	mockResult = [0];
	page_offset_roman = 2;
	page_offset_arabic = 2;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});

test(`When string pass with '135-[150]', page_offset_roman with 2, page_offset_arabic with 2, page_count with 130 and return array with range value [0]`, async () => {
	mockRaw = "135-[150]";
	mockResult = [0];
	page_offset_roman = 2;
	page_offset_arabic = 2;
	pageCount = 130;
	const item = rangeExpand(mockRaw, page_offset_roman, page_offset_arabic, pageCount);
	expect(item).toEqual(mockResult);
});
