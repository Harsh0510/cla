import getPageOffset from "../getPageOffset";

let currentPage, page_offset_roman, page_offset_arabic;

function resetAll() {
	currentPage = 4;
	page_offset_roman = 0;
	page_offset_arabic = 0;
}

beforeEach(resetAll);
afterEach(resetAll);

test("when pass currentPage=4, page_offset_roman = 0 and page_offset_arabic = 0, return with 4", async () => {
	currentPage = 4;
	page_offset_roman = 0;
	page_offset_arabic = 0;
	const pageOffset = getPageOffset(currentPage, page_offset_roman, page_offset_arabic);
	expect(pageOffset).toEqual(4);
});

test("when pass currentPage=1, page_offset_roman = 0 and page_offset_arabic = 4, return with i", async () => {
	currentPage = 1;
	page_offset_roman = 0;
	page_offset_arabic = 4;
	const pageOffset = getPageOffset(currentPage, page_offset_roman, page_offset_arabic);
	expect(pageOffset).toEqual("i");
});

test("when pass currentPage=1, page_offset_roman = 2 and page_offset_arabic = 4, return with [1]", async () => {
	currentPage = 1;
	page_offset_roman = 2;
	page_offset_arabic = 4;
	const pageOffset = getPageOffset(currentPage, page_offset_roman, page_offset_arabic);
	expect(pageOffset).toEqual("[1]");
});

test("when pass currentPage=8, page_offset_roman = 2 and page_offset_arabic = 4, return with 4", async () => {
	currentPage = 8;
	page_offset_roman = 2;
	page_offset_arabic = 4;
	const pageOffset = getPageOffset(currentPage, page_offset_roman, page_offset_arabic);
	expect(pageOffset).toEqual(4);
});
