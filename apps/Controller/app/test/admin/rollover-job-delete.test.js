const rollOverJobDeleteRaw = require("../../core/admin/rollover-job-delete");
const Context = require("../common/Context");

let ctx;
let data;
let mockIsIncludeModifyUserId;
let mockIsIncludeDateEdited;

function resetAll() {
	ctx = new Context();
	data = {
		id: 1,
	};
	ctx.appDbQuery = (query, values) => {
		if (query.indexOf("AND status = 'scheduled'") !== -1) {
			return {
				rowCount: 1,
			};
		} else {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return {
				rowCount: 1,
			};
		}
	};
	mockIsIncludeModifyUserId = false;
	mockIsIncludeDateEdited = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function rollOverJobDelete(data) {
	let err = null;
	try {
		ctx.body = await rollOverJobDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("Error when user is not a cla admin", async () => {
	ctx.sessionData.user_role = "teacher";
	expect(await rollOverJobDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.responseStatus).toEqual(401);
});

test("Error when user dont send rollover_job_id", async () => {
	delete data.id;
	expect(await rollOverJobDelete(data)).toEqual(new Error("400 ::: ID invalid"));
	expect(ctx.responseStatus).toEqual(400);
});

test("Error when user send a negative id", async () => {
	data.id = -1;
	expect(await rollOverJobDelete(data)).toEqual(new Error("400 ::: ID must not be negative"));
	expect(ctx.responseStatus).toEqual(400);
});

test("Success when user is cla admin", async () => {
	expect(await rollOverJobDelete(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: true,
	});
});

test("Success when rollover with that id is not present", async () => {
	ctx.appDbQuery = (query, values) => {
		if (query.indexOf("AND status = 'scheduled'")) {
			return {
				rowCount: 0,
			};
		} else {
			return {
				rowCount: 1,
			};
		}
	};
	expect(await rollOverJobDelete(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: false,
	});
});

test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
	expect(await rollOverJobDelete(data)).toEqual(null);
	expect(ctx.body).toEqual({
		result: true,
	});
	expect(mockIsIncludeModifyUserId).toEqual(true);
	expect(mockIsIncludeDateEdited).toEqual(true);
});
