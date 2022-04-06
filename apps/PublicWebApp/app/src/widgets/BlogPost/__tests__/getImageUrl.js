const OLD_ENV = process.env;
let imagePath = null;

beforeEach(() => {
	jest.resetModules(); // most important - it clears the cache
	process.env = { ...OLD_ENV }; // make a copy
	imagePath = "www.google.com/";
});

afterAll(() => {
	process.env = OLD_ENV; // restore old env
});

/** Component renders correctly */
test(`Returns blog url successfully if image path is passed to function`, async () => {
	process.env.EP_BLOG_URL = "blog_url/";
	const getImageUrl = require("../getImageUrl");
	const item = getImageUrl.default(imagePath);
	expect(item).toEqual("blog_url/www.google.com/");
});

test(`Returns null if image path is not passed to function`, async () => {
	process.env.EP_BLOG_URL = "blog_url/";
	const getImageUrl = require("../getImageUrl");
	const item = getImageUrl.default();
	expect(item).toEqual(null);
});

test(`Returns null if process.env.EP_BLOG_URL is not set`, async () => {
	process.env.EP_BLOG_URL = null;
	const getImageUrl = require("../getImageUrl");
	const item = getImageUrl.default(imagePath);
	expect(item).toEqual(null);
});
