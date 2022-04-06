const assetCheckPermissionsRaw = require("../../core/public/asset-check-permissions.js");
const Context = require("../common/Context");
let ctx;

function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

function getParams() {
	return {
		isbn: "9781910504734",
	};
}

jest.mock("../../core/public/common/getPermissionsStatus", () => {
	return () => "Not Found";
});

async function assetCheckPermissions(data) {
	let err = null;
	try {
		ctx.body = await assetCheckPermissionsRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("Error when no ISBN provided", async () => {
	const params = getParams();
	delete params.isbn;
	expect(await assetCheckPermissions(params, ctx)).toEqual(new Error("400 ::: isbn not provided"));
});

test("Error when not logged in", async () => {
	const params = getParams();
	ctx.sessionData = null;
	expect(await assetCheckPermissions(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test("Successfully returns status when logged in", async () => {
	const params = getParams();
	ctx.ensureLoggedIn = async (_) => null;
	ctx.getSessionData = async (_) => ({ user_role: "teacher" });
	expect(await assetCheckPermissions(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({ status: "Not Found" });
});
