const validateRaw = require("../../core/admin/validate");
const Context = require("../common/Context");

let ctx, files;

function getValidRequest() {
	return {
		assets: {
			name: "9000000000001.pdf",
		},
	};
}

jest.mock(`../../core/admin/parseUploads/playgroundAssetValidator`, () => {
	return function () {
		return {
			process: () => {
				return true;
			},
		};
	};
});

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	files = {
		assets: [
			{
				name: "9000000000001.pdf",
			},
			{
				name: "9000000000002.pdf",
			},
		],
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function validate(data) {
	let err = null;
	try {
		ctx.body = await validateRaw(data, ctx, files);
	} catch (e) {
		err = e;
	}
	return err;
}

//Error "Unauthorized" when user role is not cla-admin
test(`Error "Unauthorized" when user role is not cla-admin`, async () => {
	ctx.sessionData.user_role = "teacher";
	const data = getValidRequest();
	expect(await validate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

//Success
test(`Success`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	expect(await validate(data)).toBeNull();
	expect(ctx.body).toEqual(true);
});

//Success
test(`Success when multiple assets`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = {
		assets: [
			{
				name: "9000000000001.pdf",
			},
			{
				name: "9000000000002.pdf",
			},
		],
	};
	expect(await validate(data)).toBeNull();
	expect(ctx.body).toEqual(true);
});

//Success When files as null object
test(`Success When files as null object`, async () => {
	files = {};
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	expect(await validate(data)).toBeNull();
	expect(ctx.body).toEqual(true);
});

//Success When files as blank array
test(`Success When files as null object`, async () => {
	files = [];
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	expect(await validate(data)).toBeNull();
	expect(ctx.body).toEqual(true);
});

//Success When files asset as single object
test(`Success When files asset as single object`, async () => {
	files = {
		assets: {
			name: "9000000000001.pdf",
		},
	};
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	expect(await validate(data)).toBeNull();
	expect(ctx.body).toEqual(true);
});

test(`Success When remove asset`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const data = getValidRequest();
	delete data.assets;
	expect(await validate(data)).toBeNull();
	expect(ctx.body).toEqual(true);
});
