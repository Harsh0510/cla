import Issue from "../Issue";

let message, type, hasError;

/**
 * Reset function
 */
function resetAll() {
	message = "This field is required";
	type = "true";
	hasError = jest.fn();
}

beforeEach(resetAll);
afterEach(resetAll);

/** Test Constructor */
test(`Test Constructor`, async () => {
	const Issues = new Issue(message, type);
	expect(Issues.message).toEqual("This field is required");
	expect(Issues.type).toEqual("true");
});

/** Test methods */
test(`Test getError method`, async () => {
	const Issues = new Issue(message, type);
	const result = Issues.getError();
	expect(result).toEqual(null);
});

test(`Test getError method`, async () => {
	type = "error";
	const Issues = new Issue(message, type);
	const res = Issues.getError();
	expect(res).toEqual("This field is required");
});

test(`Test isEmpty method`, async () => {
	const Issues = new Issue(message, type);
	const result = Issues.isEmpty();
	expect(result).toEqual(false);
});

test(`Test hasError method`, async () => {
	const Issues = new Issue(message, type);
	const result = Issues.hasError();
	expect(result).toEqual(false);
});
