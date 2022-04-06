// Required to simulate window.matchMedia
import "../../../mocks/matchMedia.mock";
import ConsecutiveString from "../index";

let strArray, separator;
/**
 * Reset function
 */
function resetAll() {
	strArray = [0, 1, 2, 4, 6, 7, 8, 11, 12, 14, 15, 16];
	separator = "/";
}

beforeEach(resetAll);
afterEach(resetAll);

/** Function renders correctly */
test("Function renders correctly", async () => {
	expect(ConsecutiveString(strArray)).toEqual("0-2,4,6-8,11,12,14-16");
});

/** Function renders correctly with empty array */
test("Function renders correctly with empty array", async () => {
	strArray = [];
	expect(ConsecutiveString(strArray)).toEqual("");
});

/** Function renders correctly with single page value */
test("Function renders correctly with single page value", async () => {
	strArray = [1];
	expect(ConsecutiveString(strArray)).toEqual("1");
});

/** Function renders correctly with not consecutive number */
test("Function renders correctly with not consecutive number", async () => {
	strArray = [5, 12, 93, 892];
	expect(ConsecutiveString(strArray)).toEqual("5,12,93,892");
});

/** Function renders correctly with null value */
test("Function renders correctly with null value", async () => {
	strArray = null;
	expect(ConsecutiveString(strArray)).toEqual("");
});

/** Function renders correctly with empty string value*/
test("Function renders correctly with empty string value", async () => {
	strArray = "";
	expect(ConsecutiveString(strArray)).toEqual("");
});

/** Function renders correctly with empty string value*/
/** add separator value */
test("Function renders correctly with separator", async () => {
	expect(ConsecutiveString(strArray, separator)).toEqual("0-2/4/6-8/11,12/14-16");
});

/** Function renders correctly with empty string value*/
test("Function renders correctly with string value is only space", async () => {
	strArray = " ";
	expect(ConsecutiveString(strArray)).toEqual("");
});
