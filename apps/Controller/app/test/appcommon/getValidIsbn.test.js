const getValidIsbn = require("../../common/getValidIsbn");

let isbnString;

/** mock for isbn */
jest.mock("isbn", () => ({
	ISBN: {
		parse(a) {
			let p;
			if (a === "9876543210321") {
				p = {
					asIsbn13() {
						return a;
					},
					isValid() {
						return true;
					},
				};
			} else {
				p = {
					isValid() {
						return false;
					},
				};
			}
			return p;
		},
	},
}));

function resetAll() {
	isbnString = "9876543210321";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return null when isbn length less than '6' digit`, async () => {
	isbnString = "98765";
	const item = getValidIsbn(isbnString);
	expect(item).toEqual(null);
});

test(`Return null when isbn length more than '10' digit`, async () => {
	isbnString = "98765".repeat(21);
	const item = getValidIsbn(isbnString);
	expect(item).toEqual(null);
});

test(`Return null when isbn passed with alphanumeric`, async () => {
	isbnString = "98765abcd210321";
	const item = getValidIsbn(isbnString);
	expect(item).toEqual(null);
});

test(`Return null when passed invalid isbn`, async () => {
	isbnString = "1".repeat(13);
	const item = getValidIsbn(isbnString);
	expect(item).toEqual(null);
});

test(`Return null when isbn passed with special character`, async () => {
	isbnString = "987654321032@";
	const item = getValidIsbn(isbnString);
	expect(item).toEqual(null);
});

test(`Return true when passed valid isbn`, async () => {
	isbnString = "9789994030149";
	const item = getValidIsbn(isbnString);
	expect(item).toEqual(isbnString);
});

test(`Return true when passed valid isbn`, async () => {
	isbnString = "9789994030149";
	const item = getValidIsbn(isbnString);
	expect(item).toEqual(isbnString);
});

test(`Return null when passed isbn 10`, async () => {
	isbnString = "9789994030";
	const item = getValidIsbn(isbnString);
	expect(item).toEqual(null);
});
