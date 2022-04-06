import getMailto from "../getMailto";

let param;

/**
 * Reset function
 */
function resetAll() {
	param = {
		email: "mock@gmail.com",
		subject: "maths",
		body: "mock-body",
	};
}

beforeEach(resetAll);
afterEach(resetAll);

/** Function renders correctly */
test(`Function renders correctly`, async () => {
	const result = getMailto(param);
	expect(result).toEqual("mock@gmail.com?subject=maths&body=mock-body");

	param.email = null;
	param.subject = null;
	param.body = null;
	const result1 = getMailto(param);
	expect(result1).toEqual("");

	param.email = "mock@gmail.com";
	const result2 = getMailto(param);
	expect(result2).toEqual("mock@gmail.com");
});
