const getMaybeValidIsbn = require("../../common/getMaybeValidIsbn");

test("Return null when no isbn is passed", async () => {
	const isbn = "";
	expect(getMaybeValidIsbn(isbn)).toEqual(null);
});

test("Return null when isbn is greater than 25 digits", async () => {
	const isbn = "qwertyuiopasdfghjklzxcvbnm";
	expect(getMaybeValidIsbn(isbn)).toEqual(null);
});

test("Return null when isbn is less than 9 digits", async () => {
	const isbn = "123456";
	expect(getMaybeValidIsbn(isbn)).toEqual(null);
});

test("Return isbn value when valid isbn passed", async () => {
	const isbn = "978456123457";
	expect(getMaybeValidIsbn(isbn)).toEqual(isbn);
});

test("Return isbn value with ignoring characters which is other than digits", async () => {
	const isbn = "9784-56123-457@";
	expect(getMaybeValidIsbn(isbn)).toEqual("978456123457");
});
