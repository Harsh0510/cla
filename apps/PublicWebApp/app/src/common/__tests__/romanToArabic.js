import romanToArabic from "../../common/romanToArabic";

let value;
let mockResult;

function resetAll() {
	value = "i";
	mockResult = 1;
}

beforeEach(resetAll);
afterEach(resetAll);

test(`When roman value pass with 'i' and return numeric value with 1`, async () => {
	value = "i";
	mockResult = 1;
	const item = romanToArabic(value);
	expect(item).toEqual(mockResult);
});

test(`When roman value pass with 'iii' and return numeric value with 3`, async () => {
	value = "iii";
	mockResult = 3;
	const item = romanToArabic(value);
	expect(item).toEqual(mockResult);
});

test(`When roman value pass with 'viii' and return numeric value with 8`, async () => {
	value = "viii";
	mockResult = 8;
	const item = romanToArabic(value);
	expect(item).toEqual(mockResult);
});

test(`When roman value pass with 'xxxi' and return numeric value with 31`, async () => {
	value = "xxxi";
	mockResult = 31;
	const item = romanToArabic(value);
	expect(item).toEqual(mockResult);
});

test(`When roman value pass with 'viii' and return numeric value with 51`, async () => {
	value = "xxxxxi";
	mockResult = 51;
	const item = romanToArabic(value);
	expect(item).toEqual(mockResult);
});
