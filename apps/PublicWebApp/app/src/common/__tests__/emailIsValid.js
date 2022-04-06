import emailIsValid from "../emailIsValid";

let maybeEmail;

/**
 * Reset function
 */
function resetAll() {
	maybeEmail = "mockemail@gmail.com";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Function renders correctly */
test(`Function renders correctly`, async () => {
	const result = emailIsValid(maybeEmail);
	expect(result).toEqual(true);

	const result1 = emailIsValid();
	expect(result1).toEqual(false);
});
