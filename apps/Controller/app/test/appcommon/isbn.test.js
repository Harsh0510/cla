const isbn = require("../../common/isbn").ISBN;
let mockISBN = "9780201379624";

beforeEach(resetAll);
afterEach(resetAll);

function resetAll() {
	mockISBN = "9780201379624";
}

function getResult(isbn) {
	return { _type: "isbn13", _value: isbn };
}

test(`Return null when isbn length less than '6' digit`, async () => {
	mockISBN = "98765";
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return null when isbn length more than '10' digit`, async () => {
	mockISBN = "98765".repeat(21);
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return null when isbn passed with alphanumeric`, async () => {
	mockISBN = "98765abcd210321";
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return null when passed invalid isbn`, async () => {
	mockISBN = "1".repeat(13);
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return null when isbn passed with special character`, async () => {
	mockISBN = "987654321032@";
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return true when passed valid isbn`, async () => {
	mockISBN = "9789994030149";
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(getResult(mockISBN));
});

test(`Return null when passed invalid isbn 10`, async () => {
	mockISBN = "9789994030";
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return null when passed invalid isbn 10`, async () => {
	mockISBN = "588525576";
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return null when passed isbn as null`, async () => {
	mockISBN = null;
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return null when passed isbn as object`, async () => {
	mockISBN = { isbn: "9876543210" };
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return null when passed invalid isbn as string`, async () => {
	mockISBN = "7776543210";
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Return null when passed valid isbn 10 digits`, async () => {
	mockISBN = "0201379624";
	const item = isbn.parse(mockISBN);
	expect(item).toEqual(null);
});

test(`Test when ISBN is not a string`, async () => {
	mockISBN = 9780201379624;
	const item = isbn.parse(mockISBN);
	expect(item).toEqual({ _type: "isbn13", _value: "9780201379624" });
});

test(`Check if passed isbn is isbn 10`, async () => {
	mockISBN = "9789994030149";
	const item = isbn.parse(mockISBN);
	const result = item.isIsbn10();
	expect(result).toBe(false);
});

test(`Check if passed isbn is isbn 13`, async () => {
	mockISBN = "9789994030149";
	const item = isbn.parse(mockISBN);
	const result = item.isIsbn13();
	expect(result).toBe(true);
});

test(`Check if passed isbn is valid`, async () => {
	mockISBN = "9789994030149";
	const item = isbn.parse(mockISBN);
	const result = item.isValid();
	expect(result).toBe(true);
});

test(`Check if passed isbn is 13, otherwise covert it into isbn 13`, async () => {
	mockISBN = "9789994030149";
	const item = isbn.parse(mockISBN);
	const result = item.asIsbn13();
	expect(result).toEqual("9789994030149");
});
