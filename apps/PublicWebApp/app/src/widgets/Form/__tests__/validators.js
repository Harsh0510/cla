import validators from "../validators";

/** Test Methods */
test(`Test notEmpty Function`, async () => {
	const result = validators.notEmpty("value");
	expect(result).toEqual(null);

	const res = validators.notEmpty();
	expect(res).toEqual("a value is required");
});

test(`Test minLength Function`, async () => {
	const fun = validators.minLength(5);
	const result = fun();
	expect(result).toEqual(null);

	const result2 = fun("value string");
	expect(result2).toEqual(null);

	const result3 = fun(10);
	expect(result3).toEqual(null);

	const result4 = fun("val");
	expect(result4).toEqual("must be at least 5 characters");
});

test(`Test maxLength Function`, async () => {
	const fun = validators.maxLength(10);
	const result = fun();
	expect(result).toEqual(null);

	const result2 = fun("less 10");
	expect(result2).toEqual(null);

	const result3 = fun(10);
	expect(result3).toEqual(null);

	const result4 = fun("length geater than maxLength");
	expect(result4).toEqual("must be at most 10 characters");
});

test(`Test integer Function`, async () => {
	const result = validators.integer();
	expect(result).toEqual(null);

	const result2 = validators.integer(null);
	expect(result2).toEqual(null);

	const result3 = validators.integer(undefined);
	expect(result3).toEqual(null);

	const result4 = validators.integer(5);
	expect(result4).toEqual(null);

	const result5 = validators.integer(3.12);
	expect(result5).toEqual("must be a whole number");
});

test(`Test positiveInteger Function`, async () => {
	const result = validators.positiveInteger();
	expect(result).toEqual(null);

	const result2 = validators.positiveInteger(null);
	expect(result2).toEqual(null);

	const result3 = validators.positiveInteger(undefined);
	expect(result3).toEqual(null);

	const result4 = validators.positiveInteger(5);
	expect(result4).toEqual(null);

	const result5 = validators.positiveInteger(-5);
	expect(result5).toEqual("must be a positive number");

	const result6 = validators.positiveInteger(-3.1);
	expect(result6).toEqual("must be a positive number");
});

test(`Test string Function`, async () => {
	const result = validators.string("string value");
	expect(result).toEqual(null);

	const result2 = validators.string(25);
	expect(result2).toEqual("must be a string");

	const result3 = validators.string(3.152);
	expect(result3).toEqual("must be a string");

	const result4 = validators.string();
	expect(result4).toEqual("must be a string");

	const result5 = validators.string(undefined);
	expect(result5).toEqual("must be a string");

	const result6 = validators.string(null);
	expect(result6).toEqual("must be a string");
});

test(`Test matchesRegex Function`, async () => {
	const fun = validators.matchesRegex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
	const result = fun();
	expect(result).toEqual(null);

	const result2 = fun(25);
	expect(result2).toEqual("must be a string");

	const result3 = fun("email.com");
	expect(result3).toEqual("not a valid value");

	const result4 = fun("hello@email.com");
	expect(result4).toEqual(null);
});

test(`Test email Function`, async () => {
	const result = validators.email();
	expect(result).toEqual(null);

	const result2 = validators.email(null);
	expect(result2).toEqual(null);

	const result3 = validators.email(undefined);
	expect(result3).toEqual(null);

	const result4 = validators.email("hello@email.com");
	expect(result4).toEqual(null);

	const result5 = validators.email("password");
	expect(result5).toEqual("must be a valid email address");
});

test(`Test strongPassword Function`, async () => {
	const result = validators.strongPassword();
	expect(result).toEqual(null);

	const result2 = validators.strongPassword(null);
	expect(result2).toEqual(null);

	const result3 = validators.strongPassword(undefined);
	expect(result3).toEqual(null);

	const result4 = validators.strongPassword("Me@cla.com100");
	expect(result4).toEqual(null);

	const result5 = validators.strongPassword("password");
	expect(result5).toEqual("must be a strong password");
});
