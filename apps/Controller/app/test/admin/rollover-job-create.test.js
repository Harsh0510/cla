const rolloverJobCreateRaw = require("../../core/admin/rollover-job-create");
const Context = require("../common/Context");
let ctx;
let mockRolloverResult;
let mockSchoolResult;
let mockTargetExecutionDate;
let mockIsIncludeModifyUserId;
let mockIsIncludeDateEdited;

jest.mock("../../core/admin/lib/rolloverIntervalForFirstEmail", () => {
	return 7;
});

function getGoodDate(day) {
	let date = new Date(+new Date() + day * 24 * 60 * 60 * 1000);
	return Math.floor(date.getTime() * 0.001);
}

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

	mockSchoolResult = [{ id: 1 }];
	mockRolloverResult = [{ id: 1 }];
	mockTargetExecutionDate = getGoodDate(15);
	mockIsIncludeModifyUserId = false;
	mockIsIncludeDateEdited = false;
}

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`INSERT INTO`) !== -1) {
		return { rows: mockRolloverResult };
	}
	if (query.indexOf(`UPDATE school`) !== -1) {
		mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
		mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
		return { rows: mockSchoolResult };
	}
	return;
}

beforeEach(resetAll);
afterEach(resetAll);

async function rolloverJobCreate(data) {
	let err = null;
	try {
		ctx.body = await rolloverJobCreateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		query: "",
		filter: { territory: [], school_level: [], school_type: [], schools: [] },
		rollover_job_selected_schools: [1],
		target_execution_date: mockTargetExecutionDate,
		name: "test 1",
	};
}

test(`Error when user is not cla admin`, async () => {
	const params = getGoodParams();
	mockUserSessionData = "teacher";
	expect(await rolloverJobCreate(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user select invalid schedule date`, async () => {
	const params = getGoodParams();
	params.target_execution_date = getGoodDate(5);
	expect(await rolloverJobCreate(params, ctx)).toEqual(new Error("400 ::: Please select valid date"));
});

test(`Success`, async () => {
	const params = getGoodParams();
	expect(await rolloverJobCreate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ success: true, id: 1 });
});

test(`When rollover is not created`, async () => {
	const params = getGoodParams();
	mockRolloverResult = [{ id: null }];
	expect(await rolloverJobCreate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ success: true, id: null });
});

test(`Error when user does not select an institution`, async () => {
	const params = getGoodParams();
	params.rollover_job_selected_schools = [];
	expect(await rolloverJobCreate(params, ctx)).toEqual(new Error("400 ::: Please select at least one institution from the list"));
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const params = getGoodParams();
	expect(await rolloverJobCreate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ success: true, id: 1 });
	expect(mockIsIncludeModifyUserId).toEqual(true);
	expect(mockIsIncludeDateEdited).toEqual(true);
});
