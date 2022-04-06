const generateExtractViewUrls = require("../../core/public/generateExtractViewUrls");

let isbn13, pages, userIp;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	(isbn13 = "9876543210321"), (pages = [1]), (userIp = "");
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function getGenerateExtractViewUrls(isWatermarked, isbn13, extractOid, pages, userIp) {
	let err = null;
	try {
		return await generateExtractViewUrls(isWatermarked, isbn13, extractOid, pages, userIp);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Succeed when signle page`, async () => {
	process.env.NODE_ENV = "development";
	expect(await getGenerateExtractViewUrls(true, isbn13, null, pages, userIp)).toEqual(["https://dummyimage.com/1200x1000/ee0000/333.png&text=1"]);
});

test(`Succeed when pass multiple pages`, async () => {
	process.env.NODE_ENV = "development";
	pages = [1, 5, 9];
	expect(await getGenerateExtractViewUrls(false, isbn13, null, pages, userIp)).toEqual([
		"https://dummyimage.com/1200x1000/ee0000/333.png&text=1",
		"https://dummyimage.com/1200x1700/ee0000/333.png&text=5",
		"https://dummyimage.com/1200x1700/ee0000/333.png&text=9",
	]);
});
