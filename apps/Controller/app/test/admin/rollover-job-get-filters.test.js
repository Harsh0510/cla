const rollOverJobGetFiltersRaw = require("../../core/admin/rollover-job-get-filters");
const Context = require("../common/Context");
const rolloverJobStatus = require("../../common/rolloverJobStatus");

let ctx, data;

function resetAll() {
	ctx = new Context();
	data = null;
}

beforeEach(resetAll);
afterEach(resetAll);

async function rollOverJobGetFilters(data) {
	let err = null;
	try {
		ctx.body = await rollOverJobGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("Error when user is not a cla admin", async () => {
	ctx.sessionData.user_role = "teacher";
	expect(await rollOverJobGetFilters(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.responseStatus).toEqual(401);
});

test("Success when user is cla admin", async () => {
	expect(await rollOverJobGetFilters(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: [
			{
				data: rolloverJobStatus.map((row) => ({ id: row, title: row })),
				id: "status",
				title: "Status",
			},
		],
	});
});
