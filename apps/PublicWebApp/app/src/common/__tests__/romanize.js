import romanize from "../romanize";

let value;
let mockResult;

function resetAll() {
	value = 1;
	mockResult = "i";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`When roman value pass with 1 and return numeric value with 'i'`, async () => {
	value = 1;
	mockResult = "i";
	const item = romanize(value);
	expect(item).toEqual(mockResult);
});

test(`When roman value pass with 55 and return numeric value with 'xxxxxv'`, async () => {
	value = 55;
	mockResult = "lv";
	const item = romanize(value);
	expect(item).toEqual(mockResult);
});

test(`When pass roman number directely'`, async () => {
	value = "lv";
	mockResult = "lv";
	const item = romanize(value, true);
	expect(item).toEqual("");
});
