import FaqList from "../FaqList";

let mockFaqList;

function resetAll() {
	mockFaqList = {
		faqList: true,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** renders correctly with array only */
test("renders correctly with array only", async () => {
	const item = Array.isArray(FaqList) ? true : false;
	expect(item).toBe(true);
});

/** When passed is object */
test("When passed is object", async () => {
	const item = Array.isArray(mockFaqList) ? true : false;
	expect(item).toBe(false);
});

/** Count Object size */
test("Count Object size", async () => {
	const item = Object.keys(FaqList);
	expect(item.length).toBe(14);
});

/** Check object keys 'title' and 'description'  */
test(`Check object keys 'title' and 'description'`, async () => {
	expect(Object.keys(FaqList[0])).toEqual(["title", "description"]);
	expect(Object.keys(FaqList[1])).toEqual(["title", "description"]);
});
