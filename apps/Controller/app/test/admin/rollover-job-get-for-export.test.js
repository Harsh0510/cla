const rolloverJobGetForExportRaw = require("../../core/admin/rollover-job-get-for-export");
const Context = require("../common/Context");

let ctx, mockRolloverData, mockSchoolData;

function resetAll() {
	ctx = new Context();
	mockUserSessionData = {
		user_role: "cla-admin",
		user_id: 185692,
		school_id: 153,
	};
	ctx.getSessionData = async (_) => {
		return mockUserSessionData;
	};

	ctx.getUserRole = async (_) => {
		return mockUserSessionData.user_role;
	};

	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};

	mockRolloverData = { rows: [{ id: 1 }], rowCount: 1 };
	mockSchoolData = { rows: [{ id: 1 }], rowCount: 1 };
}

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`FROM rollover_job`) !== -1) {
		return mockRolloverData;
	}
	if (query.indexOf(`FROM school`) !== -1) {
		return mockSchoolData;
	}
	return;
}

function getGoodParams() {
	return {
		id: 1,
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function rolloverJobGetForExport(data) {
	let err = null;
	try {
		ctx.body = await rolloverJobGetForExportRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("Error when user is not a cla admin", async () => {
	const data = getGoodParams();
	mockUserSessionData.user_role = "teacher";
	expect(await rolloverJobGetForExport(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.responseStatus).toEqual(401);
});

test("Success", async () => {
	const data = getGoodParams();
	expect(await rolloverJobGetForExport(data)).toEqual(null);
	expect(ctx.body).toEqual({ rollover: { id: 1 }, schools: [{ id: 1 }] });
});

test("Error when rollover job id is invalid", async () => {
	const data = getGoodParams();
	data.id = "abc";
	expect(await rolloverJobGetForExport(data)).toEqual(new Error("400 ::: Rollover Job ID invalid"));
});

test("Error when rollover job id is not passed", async () => {
	const data = getGoodParams();
	delete data.id;
	expect(await rolloverJobGetForExport(data)).toEqual(new Error("400 ::: Rollover Job ID invalid"));
});

test("Error when rollover job id does not exist", async () => {
	const data = getGoodParams();
	mockRolloverData = [];
	expect(await rolloverJobGetForExport(data)).toEqual(new Error("400 ::: Rollover Job not found"));
});
