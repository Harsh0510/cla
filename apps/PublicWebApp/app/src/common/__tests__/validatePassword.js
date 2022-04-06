// Required to simulate window.matchMedia
import "../../mocks/matchMedia.mock";

import React from "react";
import { shallow, mount } from "enzyme";
import passwordIsStrong from "../validatePassword";

let pw;
/**
 * Reset function
 */
function resetAll() {
	pw = "";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Enter password is not string */
/** passwordIsStrong */
test("Enter password is not string", async () => {
	pw = [];
	//pw = 1;
	const item = passwordIsStrong(pw);
	expect(item).toBe("PASSWORD_8_CHARACTER");
});

test("password is not provided", async () => {
	pw = "";
	const item = passwordIsStrong(pw);
	expect(item).toBe("PASSWORD_NOT_PROVIDED");
});

/** Enter password length is below 8 */
test("Enter password length is below 8 ", async () => {
	pw = "123456";
	const item = passwordIsStrong(pw);
	expect(item).toBe("PASSWORD_8_CHARACTER");
});

/** Enter password is not any small letter */
test("Enter password is not any small letter", async () => {
	pw = "ABC123456";
	const item = passwordIsStrong(pw);
	expect(item).toBe("PASSWORD_LOWER_CHARACTER");
});

/** Enter password is not any capital letter */
test("Enter password is not any capital letter", async () => {
	pw = "abc123456";
	const item = passwordIsStrong(pw);
	expect(item).toBe("PASSWORD_UPPER_CHARACTER");
});

// /** Enter password is not any digit */
// test("Enter password is not any digit", async () => {
// 	pw = "abcABCDERF";
// 	const item = passwordIsStrong(pw);
// 	expect(item).toBe(false);
// });

/** Enter password is not any word (alpha numeric) */
test("Enter password is not any word (alpha numeric)", async () => {
	pw = "IamSchoolAdmin1";
	const item = passwordIsStrong(pw);
	expect(item).toBe("PASSWORD_SPECIAL_CHARACTER");
});

test("Enter password is not any number character", async () => {
	pw = "IamSchoolAdmin@";
	const item = passwordIsStrong(pw);
	expect(item).toBe("PASSWORD_NUMBER_CHARACTER");
});

/** Enter password is valid password */
/** Enter password is valid password */
test("Enter password is valid password", async () => {
	pw = "uswJ4zkAu81/PMTiQ";
	const item = passwordIsStrong(pw);
	expect(item).toBe(null);
});
