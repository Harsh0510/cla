const getUrl = require("../../common/getUrl");

let mockBase, suffix;

function resetAll() {
	suffix = "/works";
	mockBase = "http://localhost:16000";
}

beforeEach(resetAll);
afterEach(resetAll);

test(`Return relative url`, async () => {
	const item = getUrl(suffix);
	expect(item).toEqual(mockBase + suffix);
});

test(`When pass invalid suffix`, async () => {
	suffix = ["/works"];
	const item = getUrl(suffix);
	expect(item).toEqual(mockBase);
});

test(`When 'IS_AZURE' exist then get the url`, async () => {
	process.env.IS_AZURE = true;
	mockBase = "https://www.educationplatform.co.uk";
	const item = getUrl(suffix);
	expect(item).toEqual(mockBase + suffix);
});

test(`When 'CLA_BASE_URL' exist then get the url`, async () => {
	process.env.CLA_BASE_URL = "https://stage-schoolingplatform.com";
	mockBase = process.env.CLA_BASE_URL;
	const item = getUrl(suffix);
	expect(item).toEqual(mockBase + suffix);
});
