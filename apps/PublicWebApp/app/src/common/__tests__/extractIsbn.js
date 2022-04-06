import extractIsbn from "../../common/extractIsbn";
let mockExtractIsbn;

beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	mockExtractIsbn = "9781913063047-positive-mental-health-for-school-leaders";
}

test(`Component renders correctly`, async () => {
	const item = extractIsbn(mockExtractIsbn);
	expect(item).toEqual("9781913063047");
});

test(`Return null when isbn is not string type`, async () => {
	mockExtractIsbn = 123;
	const item = extractIsbn(mockExtractIsbn);
	expect(item).toEqual(null);
});

test("when isbn pass without number", async () => {
	mockExtractIsbn = "abc";
	const item = extractIsbn(mockExtractIsbn);
	expect(item).toEqual(null);
});

test("when isbn pass as null", async () => {
	mockExtractIsbn = null;
	const item = extractIsbn(mockExtractIsbn);
	expect(item).toEqual(null);
});
