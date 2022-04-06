const unlockViaImageRaw = require("../../core/public/unlock-via-image-upload");
const Context = require("../common/Context");

const AppFile = require("tvf-app").File;
let ctx;
let requestParams, mockGoogleResult;

function resetAll() {
	ctx = new Context();
	requestParams = {
		unlock_image: new AppFile({ size: "4MB", name: "dummyImage.png", path: "/tmp/dummyImage.png", type: "image/png" }),
	};
	mockGoogleResult = {
		error: false,
	};
	ctx.appDbQuery = (query, values) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf("SELECT name FROM school") !== -1) {
			return {
				rows: [{ name: "Test School" }],
				rowCount: 1,
			};
		} else if (query.indexOf("INSERT INTO") !== -1) {
			return;
		}
	};
}

jest.mock("../../common/unlockImageUploadHelpers", () => {
	return {
		uploadUnlockImage: async () => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve("Success");
				}, 2000);
			});
		},
	};
});

jest.mock("../../common/unlockByISBNImage", () => {
	return function () {
		return;
	};
});

jest.mock("../../common/unlockImageUploadHelpers", () => {
	return {
		uploadUnlockImage: () => {
			return;
		},
	};
});

jest.mock("../../common/isbnFromImageViaGoogleExtractorInstance", () => {
	return {
		parse: () => {
			return mockGoogleResult;
		},
	};
});

jest.mock("fs", () => {
	return {
		unlink: (imagePath, cb) => {
			cb();
		},
	};
});

beforeEach(resetAll);
afterEach(resetAll);

async function unlockViaImage(data) {
	let err = null;
	try {
		ctx.body = await unlockViaImageRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Upload not provided`, async () => {
	requestParams.unlock_image = new File(["FOO"], "test.txt", { type: "octet/txt" });
	expect(await unlockViaImage(requestParams)).toEqual(new Error("400 ::: Upload not provided"));
});

test(`Unauthorized`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.sessionData.school_id = 0;
	expect(await unlockViaImage(requestParams)).toEqual(new Error("400 ::: Unauthorized"));
});

test(`Record Gets added`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 1;
	expect(await unlockViaImage(requestParams)).toEqual(null);
	expect(ctx.body).toEqual({ result: { created: true } });
});

test(`Unlock image upload ai_error log Gets added`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 1;
	mockGoogleResult = { error: true };
	expect(await unlockViaImage(requestParams)).toEqual(null);
	expect(ctx.body).toEqual({ result: { created: true } });
});
