import eanIsValid from "../eanIsValid";

let code;
/**
 * Reset function
 */
function resetAll() {
	code = "";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Function renders correctly */
test("Function renders correctly", async () => {
	code = "9780198304494";
	expect(eanIsValid(code)).toBe(true);
});

/** Function renders with wrong isbn */
test("Function renders correctly", async () => {
	code = "9781234567890";
	expect(eanIsValid(code)).toBe(false);
});

/** Function renders with isbn is not 13 digi*/
test("Function renders with isbn is not 13 digi", async () => {
	code = "0545010225";
	expect(eanIsValid(code)).toBe(false);
});

/** Function renders with isbn is empty string*/
test("Function renders with isbn is empty string", async () => {
	code = "";
	expect(eanIsValid(code)).toBe(false);
});
