const userAssetUploadRaw = require("../../../core/public/user-asset-upload");
const Context = require("../../common/Context");

const AppFile = require("tvf-app").File;
let ctx;
let requestParams;
let mockDownloadImageResult;
let mockUpsertAssetResult;
let mockSendEmail = false;

jest.mock("../../../core/public/user-asset-upload/downloadImage", () => {
	return () => {
		return mockDownloadImageResult;
	};
});

jest.mock("../../../core/public/user-asset-upload/fetchPublisherId", () => {
	return () => 1;
});

jest.mock("../../../core/public/user-asset-upload/fetchAuthors", () => {
	return () => [{ id: 1 }, { id: 2 }, { id: 3 }];
});

jest.mock("../../../core/public/user-asset-upload/upsertAsset", () => {
	return () => {
		return mockUpsertAssetResult;
	};
});

jest.mock("../../../core/public/user-asset-upload/upsertAssetUserUpload", () => {
	return () => 1;
});

jest.mock("../../../core/public/user-asset-upload/createExtract", () => {
	return () => {
		return new Promise((resolve, reject) => {
			return resolve("a".repeat(32));
		});
	};
});

jest.mock("../../../core/public/user-asset-upload/moveCoverImageToAzure", () => {
	return () => {
		return true;
	};
});

jest.mock("#tvf-util", () => {
	const tvfUtil = {
		generateObjectIdentifier: async () => "b".repeat(32),
	};
	return tvfUtil;
});
jest.mock("../../../core/public/common/getPermissionsStatus", () => {
	return () => {
		return "Not Found";
	};
});

jest.mock("../../../common/sendEmail", () => {
	return {
		sendTemplate: () => {
			mockSendEmail = true;
		},
	};
});

const asyncRunner = new (class {
	async pushTask() {
		return;
	}
})();

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
}

function resetAll() {
	ctx = new Context();
	ctx.getSessionData = getGoodSessionData;
	requestParams = {
		asset: new AppFile({ size: "4MB", name: "dummyPdf.pdf", path: "/tmp/dummyPdf.pdf", type: "application/pdf" }),
		title: "Some title here: First",
		isbn: "9780545010221",
		publication_date: 1167676200,
		page_count: 100,
		pages: [1],
		authors: ["Lake Johnson", " Mary", "John Smith"],
		publisher: "Hodder",
		page_range: 1,
		image: "https://dummyimage.com/600x400/c722c7/43499c&text=test",
		upload_name: "upload name",
		copy_ratio: 0.01,
		is_copying_full_chapter: false,
		is_created_extract: true,
	};
	mockDownloadImageResult = new Promise((resolve, reject) => {
		return resolve("/tmp/626262626262");
	});
	mockUpsertAssetResult = {
		id: 1,
		did_insert: true,
		copyable_page_count: 10,
	};
	ctx.appDbQuery = (q, b) => {
		binds = b;
		return {
			rows: [{ first_name: "test", last_name: "abc" }],
			rowCount: 1,
		};
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function userAssetUpload(data) {
	let err = null;
	try {
		ctx.body = await userAssetUploadRaw(data, ctx, asyncRunner);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is not logged in`, async () => {
	ctx.getSessionData = () => {
		return {};
	};
	expect(await userAssetUpload(requestParams)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`If permission status is 'Not Found' then sendEmail is called`, async () => {
	await userAssetUpload(requestParams);
	expect(mockSendEmail).toBe(true);
});

test(`Asset uploaded succesfully without creating copy`, async () => {
	mockDownloadImageResult = new Promise((resolve, reject) => {
		return reject();
	});
	expect(await userAssetUpload(requestParams)).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test(`Asset uploaded succesfully without cover image`, async () => {
	delete requestParams.image;
	expect(await userAssetUpload(requestParams)).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test(`When asset with isbn is already exist`, async () => {
	mockUpsertAssetResult = {
		id: 1,
		did_insert: false,
		copyable_page_count: 10,
	};
	expect(await userAssetUpload(requestParams)).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test(`Asset uploaded succesfully with creating copy`, async () => {
	requestParams.course_oid = "dbe4b2044c6d9bf8ef18f8169f0d6b0e84f3";
	requestParams.is_created_copy = true;
	requestParams.students_in_course = 10;
	expect(await userAssetUpload(requestParams)).toEqual(null);
	expect(ctx.body).toEqual({
		extract_oid: "a".repeat(32),
		oid: "b".repeat(32),
	});
});

test(`Asset uploaded succesfully with full chapter`, async () => {
	requestParams.is_copying_full_chapter = true;
	expect(await userAssetUpload(requestParams)).toEqual(null);
	expect(ctx.body).toEqual({
		created: true,
	});
});

test(`When user tries to copy more than book pages`, async () => {
	requestParams.pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
	expect(await userAssetUpload(requestParams)).toEqual(new Error("400 ::: Copy ratio should be between 0 to 1"));
	expect(ctx.body).toEqual(null);
});

test(`When asset has 0 copyable pages`, async () => {
	mockUpsertAssetResult = {
		id: 1,
		did_insert: false,
		copyable_page_count: 0,
	};
	expect(await userAssetUpload(requestParams)).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});
