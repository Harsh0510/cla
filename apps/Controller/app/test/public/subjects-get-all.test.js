const subjectsGetAllRaw = require("../../core/public/subjects-get-all");
const Context = require("../common/Context");

let ctx;
/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function subjectsGetAll(data) {
	let err = null;
	try {
		ctx.body = await subjectsGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

/**Get unknow error*/
test(`Get unknow error`, async () => {
	ctx.doAppQuery = (query) => {
		throw new Error("Error");
	};
	expect(await subjectsGetAll()).toEqual(new Error("400 ::: Unknown error"));
});

/**Get All Get All Subjects Data Successfully*/
test(`Get All Subjects Data Successfully`, async () => {
	ctx.doAppQuery = (query) => {
		return { rows: [{ code: "A", name: "The arts" }] };
	};
	expect(await subjectsGetAll()).toBeNull();
	expect(ctx.body).toEqual({ result: [{ code: "A", name: "The arts" }] });
});
