const generateAzureExtractViewUrls = require("../../core/public/generateAzureExtractViewUrls");

let isbn13, pages, userIp, remoteResource, permissions;

jest.mock("../../core/admin/azure/BlobService", () => {
	return class {
		init(a, b, c, d) {
			this.blobService = function () {
				() => jest.fn();
			};
		}

		constructor() {
			this.init.apply(this, arguments);
		}

		generateSasToken() {
			return {
				token: "abc123",
				uri: "https://dummyimage.com/assets/pages-high-quality/9780198354673_17.png",
			};
		}
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	isbn13 = "9876543210321";
	pages = [1];
	userIp = null;
	containerName = "";
	permissions = "r";
	remoteResource = "";
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function getGenerateAzureExtractViewUrls(isWatermarked, isbn13, extractOid, pages, userIp) {
	let err = null;
	try {
		return await generateAzureExtractViewUrls(isWatermarked, isbn13, extractOid, pages, userIp);
	} catch (e) {
		err = e;
	}
	return err;
}

/** NODE_ENV is not passe so it display dummy image url */
test(`Succeed when NODE_ENV isnot development`, async () => {
	expect(await getGenerateAzureExtractViewUrls(true, isbn13, null, pages, userIp)).toEqual([
		"https://dummyimage.com/assets/pages-high-quality/9780198354673_17.png",
	]);
});

/** get multiple pages url */
test(`Succeed when pass multiple pages`, async () => {
	pages = [1, 5, 9];
	expect(await getGenerateAzureExtractViewUrls(false, isbn13, null, pages, userIp)).toEqual([
		"https://dummyimage.com/assets/pages-high-quality/9780198354673_17.png",
		"https://dummyimage.com/assets/pages-high-quality/9780198354673_17.png",
		"https://dummyimage.com/assets/pages-high-quality/9780198354673_17.png",
	]);
});

/** if we pass NODE_ENV as development and userIP too then userIP is null and get normal url */
test(`Succeed when NODE_ENV is development and pass userIp`, async () => {
	pages = [1];
	userIp = "192.168.1.1";
	expect(await getGenerateAzureExtractViewUrls(false, isbn13, null, pages, userIp)).toEqual([
		"https://dummyimage.com/assets/pages-high-quality/9780198354673_17.png",
	]);
});
