const schoolGetIdsRaw = require("../../core/admin/school-get-ids");
const Context = require("../common/Context");

let ctx, mockUserSessionData, mockResult;

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
	mockResult = [{ id: 1 }, { id: 2 }, { id: 3 }];
}

beforeEach(resetAll);
afterEach(resetAll);

async function getGoodAmmDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf(`SELECT id FROM school`) !== -1) {
		return { rows: mockResult };
	}
	return;
}

async function schoolGetIds(data) {
	let err = null;
	try {
		ctx.body = await schoolGetIdsRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		query: "",
		filter: { territory: [], school_level: [], school_type: [], schools: [] },
		rollover_job_selected_schools: [],
		target_execution_date: 1624300200,
		name: "test 1",
	};
}

test(`Success`, async () => {
	const params = getGoodParams();
	expect(await schoolGetIds(params)).toEqual(null);
	expect(ctx.body).toEqual([1, 2, 3]);
});

test(`Error when user pass wrong query params`, async () => {
	const params = getGoodParams();
	params.query = 123;
	expect(await schoolGetIds(params, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Success when user pass query params`, async () => {
	const params = getGoodParams();
	params.query = "test";
	expect(await schoolGetIds(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual([1, 2, 3]);
});

test(`Success when rollover school is paased and all schools is selected`, async () => {
	const params = getGoodParams();
	params.rollover_job_selected_schools = [1];
	expect(await schoolGetIds(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual([1, 2, 3]);
});

test(`Success when only rollover school is paased`, async () => {
	const params = getGoodParams();
	params.rollover_job_selected_schools = [1];
	expect(await schoolGetIds(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual([1, 2, 3]);
});

test(`Error when user pass filter territory as wrong value`, async () => {
	const params = getGoodParams();
	params.filter = {
		territory: ["abc"],
	};
	expect(await schoolGetIds(params)).toEqual(new Error("400 ::: Territory not found"));
});

test(`Error when user pass too many filters`, async () => {
	const params = getGoodParams();
	params.filter = {
		territory: ["england"],
		school_level: ["nursery"],
		school_type: ["academy"],
		schools: ["abc"],
		schoolsA: ["abc"],
	};
	expect(await schoolGetIds(params)).toEqual(new Error("400 ::: Too many filters provided"));
});

test(`Success when user pass filter as valid values `, async () => {
	const params = getGoodParams();
	params.filter = {
		territory: ["england"],
		school_level: ["nursery"],
		school_type: ["academy"],
	};
	params.query = "School";
	expect(await schoolGetIds(params)).toBeNull();
});

test(`Error when user pass filter school_level as wrong value`, async () => {
	const params = getGoodParams();
	params.filter = {
		territory: ["england"],
		school_level: ["nursery"],
		school_type: ["abc"],
	};
	expect(await schoolGetIds(params)).toEqual(new Error("400 ::: School type not found"));
});

test(`Success when school is passed in filters`, async () => {
	const params = getGoodParams();
	params.filter = {
		schools: [1],
	};
	expect(await schoolGetIds(params, ctx)).toEqual(null);
	expect(ctx.body).toEqual([1, 2, 3]);
});

test(`Success when filters id not passed`, async () => {
	const params = getGoodParams();
	delete params.filter;
	expect(await schoolGetIds(params)).toEqual(null);
	expect(ctx.body).toEqual([1, 2, 3]);
});

test(`Success when rollover id is passed`, async () => {
	const params = getGoodParams();
	params.rollover_job_id = 1;
	expect(await schoolGetIds(params)).toEqual(null);
	expect(ctx.body).toEqual([1, 2, 3]);
});
