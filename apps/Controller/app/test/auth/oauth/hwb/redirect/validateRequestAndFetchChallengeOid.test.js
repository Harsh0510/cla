jest.mock("../../../../../core/auth/oauth/hwb/common/hmac.js", () => {
	return (str) => str.toUpperCase();
});

const validate = require("../../../../../core/auth/oauth/hwb/redirect/validateRequestAndFetchChallengeOid");

test("error 1", () => {
	const [err, oid] = validate({
		error: "abc",
	});
	expect(err).toBe("abc");
	expect(oid).toBeUndefined();
});

test("error 1 - with description", () => {
	const [err, oid] = validate({
		error: "abc",
		error_description: "def",
	});
	expect(err).toBe("abc: def");
	expect(oid).toBeUndefined();
});

test("error 2", () => {
	const [err, oid] = validate({});
	expect(!!err).toBe(true);
	expect(oid).toBeUndefined();
});

test("error 3", () => {
	const [err, oid] = validate({
		code: "hello",
		state: "not valid",
	});
	expect(!!err).toBe(true);
	expect(oid).toBeUndefined();
});

test("error 4", () => {
	const [err, oid] = validate({
		code: "hello",
		state: "not_valid",
	});
	expect(!!err).toBe(true);
	expect(oid).toBeUndefined();
});

test("success", () => {
	const [err, oid] = validate({
		code: "hello",
		state: "valid_VALID",
	});
	expect(err).toBe(null);
	expect(oid).toBe("valid");
});
