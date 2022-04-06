const ensure = require("../main/index");

const ctx = {};

beforeEach(function () {
	ctx.assert = jest.fn(function (expr, code, msg) {
		if (!expr) {
			throw new Error(`${code} ::: ${msg}`);
		}
	});
});

describe(`nonEmptyStr`, () => {
	test(`Errors when value not provided`, async () => {
		expect((_) => ensure.nonEmptyStr(ctx, undefined, "foo")).toThrow("400 ::: foo not provided");
	});
	test(`Errors when provided value is empty string`, async () => {
		expect((_) => ensure.nonEmptyStr(ctx, "", "foo")).toThrow("400 ::: foo not provided");
	});
	test(`Errors when provided value is not a string`, async () => {
		expect((_) => ensure.nonEmptyStr(ctx, 53, "foo")).toThrow("400 ::: foo invalid");
	});
	test(`Succeeds when non-empty string is provided`, async () => {
		expect(ensure.nonEmptyStr(ctx, "hello!", "foo")).toBeUndefined();
	});
});

describe(`nonNegativeInteger`, () => {
	test(`Errors when value not provided`, async () => {
		expect((_) => ensure.nonNegativeInteger(ctx, undefined, "foo")).toThrow("400 ::: foo invalid");
	});
	test(`Errors when provided value is not a number`, async () => {
		expect((_) => ensure.nonNegativeInteger(ctx, "", "foo")).toThrow("400 ::: foo invalid");
	});
	test(`Errors when provided value is a negative number`, async () => {
		expect((_) => ensure.nonNegativeInteger(ctx, -53, "foo")).toThrow("400 ::: foo must not be negative");
	});
	test(`Errors when provided value is a positive non-integer`, async () => {
		expect((_) => ensure.nonNegativeInteger(ctx, 5.3, "foo")).toThrow("400 ::: foo must be an integer");
	});
	test(`Succeeds when 0 is passed`, async () => {
		expect(ensure.nonNegativeInteger(ctx, 0, "foo")).toBeUndefined();
	});
	test(`Succeeds when positive integer is passed`, async () => {
		expect(ensure.nonNegativeInteger(ctx, 20, "foo")).toBeUndefined();
	});
});

describe(`positiveInteger`, () => {
	test(`Errors when value not provided`, async () => {
		expect((_) => ensure.positiveInteger(ctx, undefined, "foo")).toThrow("400 ::: foo invalid");
	});
	test(`Errors when provided value is not a number`, async () => {
		expect((_) => ensure.positiveInteger(ctx, "", "foo")).toThrow("400 ::: foo invalid");
	});
	test(`Errors when provided value is a negative number`, async () => {
		expect((_) => ensure.positiveInteger(ctx, -53, "foo")).toThrow("400 ::: foo must be positive");
	});
	test(`Errors when provided value is a positive non-integer`, async () => {
		expect((_) => ensure.positiveInteger(ctx, 5.3, "foo")).toThrow("400 ::: foo must be an integer");
	});
	test(`Errors when 0 is passed`, async () => {
		expect((_) => ensure.positiveInteger(ctx, 0, "foo")).toThrow(`400 ::: foo must be positive`);
	});
	test(`Succeeds when positive integer is passed`, async () => {
		expect(ensure.positiveInteger(ctx, 20, "foo")).toBeUndefined();
	});
});

describe(`isEmail`, () => {
	test(`Errors when value not provided`, async () => {
		expect((_) => ensure.isEmail(ctx, undefined, "foo")).toThrow("400 ::: foo not provided");
	});
	test(`Errors when provided value is not a string`, async () => {
		expect((_) => ensure.isEmail(ctx, 45, "foo")).toThrow("400 ::: foo invalid");
	});
	test(`Errors when provided value is not a valid email address`, async () => {
		expect((_) => ensure.isEmail(ctx, "not valid", "foo")).toThrow("400 ::: foo not valid");
	});
	test(`Succeeds with valid email address`, async () => {
		expect(ensure.isEmail(ctx, "this@is.valid", "foo")).toBeUndefined();
	});
});
