const rolloverJobUpdateRaw = require("../../core/admin/rollover-job-update");
const Context = require("../common/Context");
let ctx;
let mockTargetExecutionDate;
let mockIsIncludeModifyUserIdForJobIdZero;
let mockIsIncludeDateEditedForJobIdZero;
let mockIsIncludeModifyUserIdForJobIdNotZero;
let mockIsIncludeDateEditedForJobIdNotZero;

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

	mockTargetExecutionDate = getGoodDate(15);
	mockIsIncludeModifyUserIdForJobIdZero = false;
	mockIsIncludeDateEditedForJobIdZero = false;
	mockIsIncludeModifyUserIdForJobIdNotZero = false;
	mockIsIncludeDateEditedForJobIdNotZero = false;
}

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`UPDATE school SET rollover_job_id = 0`) !== -1) {
		mockIsIncludeModifyUserIdForJobIdZero = query.indexOf("modified_by_user_id") !== -1 ? true : false;
		mockIsIncludeDateEditedForJobIdZero = query.indexOf("date_edited") !== -1 ? true : false;
		return { rows: [{ id: 1 }], rowCount: 1 };
	}
	if (query.indexOf(`UPDATE school SET rollover_job_id =`) !== -1) {
		mockIsIncludeModifyUserIdForJobIdNotZero = query.indexOf("modified_by_user_id") !== -1 ? true : false;
		mockIsIncludeDateEditedForJobIdNotZero = query.indexOf("date_edited") !== -1 ? true : false;
		return { rows: [{ id: 1 }], rowCount: 1 };
	}
	if (query.indexOf(`UPDATE rollover_job`) !== -1) {
		return { rows: [{ id: 1 }], rowCount: 1 };
	}
	return;
}

beforeEach(resetAll);
afterEach(resetAll);

async function rolloverJobUpdate(data) {
	let err = null;
	try {
		ctx.body = await rolloverJobUpdateRaw(data, ctx);
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
		id: 1,
	};
}

test(`Error when user is not cla admin`, async () => {
	const params = getGoodParams();
	mockUserSessionData = "teacher";
	expect(await rolloverJobUpdate(params, ctx)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Success`, async () => {
	const params = getGoodParams();
	expect(await rolloverJobUpdate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when no field is changed`, async () => {
	const params = getGoodParams();
	delete params.name;
	delete params.target_execution_date;
	delete params.rollover_job_selected_schools;
	expect(await rolloverJobUpdate(params, ctx)).toEqual(new Error("400 ::: No fields changed"));
});

test(`Error when user select invalid schedule date`, async () => {
	const params = getGoodParams();
	params.target_execution_date = getGoodDate(5);
	expect(await rolloverJobUpdate(params, ctx)).toEqual(new Error("400 ::: Please select valid date"));
});

test(`Success when only name and target execution is updated`, async () => {
	const params = getGoodParams();
	delete params.rollover_job_selected_schools;
	expect(await rolloverJobUpdate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when user does not select institution`, async () => {
	const params = getGoodParams();
	params.rollover_job_selected_schools = [];
	expect(await rolloverJobUpdate(params, ctx)).toEqual(new Error("400 ::: Select at-least one institution from the list"));
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const params = getGoodParams();
	expect(await rolloverJobUpdate(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeModifyUserIdForJobIdZero).toEqual(true);
	expect(mockIsIncludeDateEditedForJobIdZero).toEqual(true);
	expect(mockIsIncludeModifyUserIdForJobIdNotZero).toEqual(true);
	expect(mockIsIncludeDateEditedForJobIdNotZero).toEqual(true);
});
