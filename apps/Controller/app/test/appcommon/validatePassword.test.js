const validatePassword = require("../../common/validatePassword");

test("When password is not given", async () => {
	const item = validatePassword("");
	expect(item).toBe("Password not provided");
});

test("When password character less then 8 characters.", async () => {
	const item = validatePassword("apple");
	expect(item).toBe("Password must be at least 8 characters.");
});

test("When password not contain any lower character.", async () => {
	const item = validatePassword("PASSWORD1");
	expect(item).toBe("Password must contain at least one lowercase letter.");
});

test("When password not contain any upper character.", async () => {
	const item = validatePassword("password1");
	expect(item).toBe("Password must contain at least one uppercase letter.");
});

test("When password not contain any number.", async () => {
	const item = validatePassword("Password");
	expect(item).toBe("Password must contain at least one number.");
});

test("When password not contain any special character.", async () => {
	const item = validatePassword("Password1");
	expect(item).toBe("Password must contain at least one special character.");
});

test("When perfect validate password enter.", async () => {
	const item = validatePassword("P@ssword1");
	expect(item).toBe(null);
});
