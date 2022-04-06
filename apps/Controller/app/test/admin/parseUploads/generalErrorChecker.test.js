const generalErrorCheckerRaw = require("../../../core/admin/parseUploads/generalErrorChecker");
const Context = require("../../common/Context");

let root;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	root = {
		attribs: {
			release: "3.0",
		},
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function generalErrorChecker(data) {
	let err = null;
	try {
		ctx.body = await generalErrorCheckerRaw(data);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error "Valid XML not found."`, async () => {
	root = null;
	expect(await generalErrorChecker(root)).toEqual(new Error("Valid XML not found."));
	expect(ctx.body).toBeNull();
});

test(`Success`, async () => {
	expect(await generalErrorChecker(root)).toBeNull();
	expect(ctx.body).toBe(undefined);
});
