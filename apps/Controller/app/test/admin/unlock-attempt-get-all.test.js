jest.mock("../../core/admin/azure/BlobResource", () => {
	return class {
		constructor(name, filename) {
			this.name = name;
			this.filename = filename;
		}
	};
});

jest.mock("../../core/admin/azure/azureBlobService", () => {
	return {
		generateSasToken() {
			return { uri: "test" };
		},
	};
});

const unloackAttemptGetAllRaw = require("../../core/admin/unlock-attempt-get-all");
const Context = require("../common/Context");

let ctx, data;

function resetAll() {
	ctx = new Context();
	data = null;
}

beforeEach(resetAll);
afterEach(resetAll);

async function unloackAttemptGetAll(data) {
	let err = null;
	try {
		ctx.body = await unloackAttemptGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is not a cla admin`, async () => {
	ctx.sessionData.user_role = "teacher";
	expect(await unloackAttemptGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.responseStatus).toEqual(401);
});

test(`Error when user is not a cla admin`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	const result = await unloackAttemptGetAll(data);
	expect(result).toEqual(null);
	expect(ctx.body).toEqual({ uri: "test" });
});
