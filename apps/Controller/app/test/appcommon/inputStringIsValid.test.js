const inputStringIsValidRaw = require("../../common/inputStringIsValid");
const Context = require("../common/Context");
const RegExPatterns = require("../../common/RegExPatterns");

let ctx;

function resetAll() {
	ctx = new Context();
	value = "foo";
	name = "First Name";
	pattern = RegExPatterns.name;
}

beforeEach(resetAll);
afterEach(resetAll);

describe(`Validate 'nameIsValid'`, () => {
	function resetNameIsvalid() {
		value = "foo";
		name = "First Name";
		pattern = RegExPatterns.name;
	}

	beforeEach(resetNameIsvalid);
	afterEach(resetNameIsvalid);

	async function nameIsValid() {
		let err = null;
		try {
			ctx.body = await inputStringIsValidRaw.nameIsValid(ctx, value, name, pattern);
		} catch (e) {
			err = e;
		}
		return err;
	}

	test(`Error when string not provided `, async () => {
		value = null;
		expect(await nameIsValid()).toEqual(new Error("400 ::: First Name not provided"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed with object `, async () => {
		value = {};
		expect(await nameIsValid()).toEqual(new Error("400 ::: First Name invalid"));
		expect(ctx.body).toBeNull();
	});

	test(`Error  when value passed with array `, async () => {
		value = [];
		expect(await nameIsValid()).toEqual(new Error("400 ::: First Name invalid"));
		expect(ctx.body).toBeNull();
	});

	test(`Error  when value passed with speacial character `, async () => {
		value = "foo_@~{}_+!£$%^&/*,./[];";
		expect(await nameIsValid()).toEqual(new Error("400 ::: First Name should not contain special characters"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed more than 255 character`, async () => {
		value = "a".repeat(256);
		expect(await nameIsValid()).toEqual(new Error("400 ::: First Name should not contain special characters"));
		expect(ctx.body).toBeNull();
	});

	test(`Return null when passed valid string `, async () => {
		value = "foo";
		expect(await nameIsValid()).toEqual(null);
	});
});

describe(`Validate 'isAlphaNumeric'`, () => {
	function resetIsAlphaNumeric() {
		value = "123456A";
		name = "Post Code";
		pattern = RegExPatterns.alphaNumeric;
	}

	beforeEach(resetIsAlphaNumeric);
	afterEach(resetIsAlphaNumeric);

	async function isAlphaNumeric() {
		let err = null;
		try {
			ctx.body = await inputStringIsValidRaw.isAlphaNumeric(ctx, value, name, pattern);
		} catch (e) {
			err = e;
		}
		return err;
	}

	test(`Error when string not provided `, async () => {
		value = null;
		expect(await isAlphaNumeric()).toEqual(new Error("400 ::: Post Code not provided"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed with object `, async () => {
		value = {};
		expect(await isAlphaNumeric()).toEqual(new Error("400 ::: Post Code invalid"));
		expect(ctx.body).toBeNull();
	});

	test(`Error  when value passed with array `, async () => {
		value = [];
		expect(await isAlphaNumeric()).toEqual(new Error("400 ::: Post Code invalid"));
		expect(ctx.body).toBeNull();
	});

	test(`Error  when value passed with speacial character `, async () => {
		value = "foo_@~{}_+!£$%^&/*,./[];";
		expect(await isAlphaNumeric()).toEqual(new Error("400 ::: Post Code should not contain special characters"));
		expect(ctx.body).toBeNull();
	});

	test(`Return null when passed valid string `, async () => {
		expect(await isAlphaNumeric()).toEqual(null);
	});
});

describe(`Validate 'lengthIsValid'`, () => {
	function resetLengthIsValid() {
		value = "foo";
		name = "Title";
		minLength = 1;
		maxLength = 20;
	}

	beforeEach(resetLengthIsValid);
	afterEach(resetLengthIsValid);

	async function lengthIsValid() {
		let err = null;
		try {
			ctx.body = await inputStringIsValidRaw.lengthIsValid(ctx, value, name, minLength, maxLength);
		} catch (e) {
			err = e;
		}
		return err;
	}

	test(`Error when string not provided `, async () => {
		value = null;
		expect(await lengthIsValid()).toEqual(new Error("400 ::: Title not provided"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed with object `, async () => {
		value = {};
		expect(await lengthIsValid()).toEqual(new Error("400 ::: Title invalid"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed with array `, async () => {
		value = [];
		expect(await lengthIsValid()).toEqual(new Error("400 ::: Title invalid"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed not between min and max value length`, async () => {
		value = "a".repeat(25);
		expect(await lengthIsValid()).toEqual(new Error("400 ::: Title must be between 1 and 20 characters"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed more than maxlength`, async () => {
		value = "a".repeat(25);
		minLength = null;
		expect(await lengthIsValid()).toEqual(new Error("400 ::: Title must not exceed 20 characters"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed less than minlength`, async () => {
		value = "a".repeat(2);
		minLength = 5;
		maxLength = null;
		expect(await lengthIsValid()).toEqual(new Error("400 ::: Title must be at least 5 characters"));
		expect(ctx.body).toBeNull();
	});

	test(`Passed value with no any min and max length allowed`, async () => {
		value = "a".repeat(2);
		minLength = null;
		maxLength = null;
		expect(await lengthIsValid()).toEqual(null);
	});
});

describe(`Validate 'nonNegativeIntegerWithMinMax'`, () => {
	function resetNonNegativeIntegerWithMinMax() {
		value = 5;
		name = "Number of student";
		minLength = 1;
		maxLength = 10;
	}

	beforeEach(resetNonNegativeIntegerWithMinMax);
	afterEach(resetNonNegativeIntegerWithMinMax);

	async function nonNegativeIntegerWithMinMax() {
		let err = null;
		try {
			ctx.body = await inputStringIsValidRaw.nonNegativeIntegerWithMinMax(ctx, value, name, minLength, maxLength);
		} catch (e) {
			err = e;
		}
		return err;
	}

	test(`Error when value passed with object `, async () => {
		value = {};
		expect(await nonNegativeIntegerWithMinMax()).toEqual(new Error("400 ::: Number of student invalid"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed with array `, async () => {
		value = [];
		expect(await nonNegativeIntegerWithMinMax()).toEqual(new Error("400 ::: Number of student invalid"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when passed value not integer `, async () => {
		value = 1.5236;
		expect(await nonNegativeIntegerWithMinMax()).toEqual(new Error("400 ::: Number of student must be an integer"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when passed nagative value`, async () => {
		value = -1;
		expect(await nonNegativeIntegerWithMinMax()).toEqual(new Error("400 ::: Number of student must not be negative"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed not between min and max value length`, async () => {
		value = 15;
		minLength = 1;
		maxLength = 10;
		expect(await nonNegativeIntegerWithMinMax()).toEqual(new Error("400 ::: Number of student must be between 1 and 10"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed more than maxlength`, async () => {
		value = 15;
		minLength = null;
		maxLength = 10;
		expect(await nonNegativeIntegerWithMinMax()).toEqual(new Error("400 ::: Number of student must not exceed 10"));
		expect(ctx.body).toBeNull();
	});

	test(`Error when value passed less than minlength`, async () => {
		value = 1;
		minLength = 5;
		maxLength = null;
		expect(await nonNegativeIntegerWithMinMax()).toEqual(new Error("400 ::: Number of student must be at least 5"));
		expect(ctx.body).toBeNull();
	});

	test(`Passed value with no any min and max length allowed`, async () => {
		value = 5;
		minLength = null;
		maxLength = null;
		expect(await nonNegativeIntegerWithMinMax()).toEqual(null);
	});
});
