import getPageOffsetString from "../getPageOffsetString";

let strArray,
	page_offset_roman,
	page_offset_arabic,
	separator = ",";

function resetAll() {
	strArray = [1, 2, 3, 5, 9];
	page_offset_roman = 0;
	page_offset_arabic = 0;
	separator = ",";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`when pass strArray=[1,2,3,5,9], page_offset_roman = 0 and page_offset_arabic = 0, return pageOffset string as '1-3,5,9'`, async () => {
	strArray = [1, 2, 3, 5, 9];
	page_offset_roman = 0;
	page_offset_arabic = 0;
	separator = ",";
	const pageOffsetString = getPageOffsetString(strArray, (page_offset_roman = 0), (page_offset_arabic = 0));
	expect(pageOffsetString).toEqual("1-3, 5, 9");
});

test(`when pass strArray=[1,2,3,5,9], page_offset_roman = 2 and page_offset_arabic = 4, return pageOffset string as '[1]-i,1,5'`, async () => {
	strArray = [1, 2, 3, 5, 9];
	page_offset_roman = 2;
	page_offset_arabic = 4;
	separator = ",";
	const pageOffsetString = getPageOffsetString(strArray, page_offset_roman, page_offset_arabic);
	expect(pageOffsetString).toEqual("[1]-i, 1, 5");
});

test(`when pass strArray='', page_offset_roman = 2 and page_offset_arabic = 4, return pageOffset string as ''`, async () => {
	strArray = "";
	page_offset_roman = 2;
	page_offset_arabic = 4;
	separator = ",";
	const pageOffsetString = getPageOffsetString(strArray, page_offset_roman, page_offset_arabic);
	expect(pageOffsetString).toEqual("");
});

test(`when pass strArray=[1] return pageOffset string as 1`, async () => {
	strArray = [1];
	const pageOffsetString = getPageOffsetString(strArray);
	expect(pageOffsetString).toEqual(1);
});
