const OLD_ENV = process.env;

beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
});

afterAll(() => {
	process.env = OLD_ENV; // restore old env
});

test("CLA_GOOGLE_CLOUD_CREDS is not present in env", async () => {
	const isbnFromImageGoogle = require("../../common/isbnFromImageViaGoogleExtractorInstance");
	const isbn = await isbnFromImageGoogle.parse("4000");
	expect(isbn.isbn).toBe(null);

	const isbnparser = await isbnFromImageGoogle.parse("");
	expect(isbnparser.error).toBe(null);
});

test("CLA_GOOGLE_CLOUD_CREDS is present in env", async () => {
	process.env.CLA_GOOGLE_CLOUD_CREDS = true;
	const isbnFromImageGoogle = require("../../common/isbnFromImageViaGoogleExtractorInstance");
	const isbn = await isbnFromImageGoogle.parse("4000");
	expect(isbn.isbn).toBe(undefined);
});
