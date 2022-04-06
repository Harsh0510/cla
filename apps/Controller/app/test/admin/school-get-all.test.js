const schoolGetAllRaw = require("../../core/admin/school-get-all");
const Context = require("../common/Context");

let ctx, schoolResult;

function getValidRequest() {
	return {
		limit: 1,
		offset: 0,
		sort_field: "name",
		sort_direction: "A",
		query: "",
	};
}

function resetAll() {
	ctx = new Context();
	schoolResult = [
		{
			id: 2,
			identifier: "c81e728d9d4c2f636f067f89cc14862c",
			name: "Another School",
			address1: "[address line 1]",
			address2: "[address line 2]",
			city: "London",
			county: null,
			post_code: "ABC 123",
			territory: "england",
			local_authority: "local authority here",
			school_level: "first",
			school_type: null,
			school_home_page: null,
			number_of_students: 50,
			gsg: "c81e728d9d4c2f636f067f89cc14862c",
			dfe: "",
			seed: "",
			nide: "nide",
			hwb_identifier: "hwb_identifier",
		},
	];
}

beforeEach(resetAll);
afterEach(resetAll);

async function schoolGetAll(data) {
	let err = null;
	try {
		ctx.body = await schoolGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is not a school or cla admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await schoolGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when sort field is not specified`, async () => {
	const data = getValidRequest();
	delete data.sort_field;
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

test(`Error when sort field does not exist`, async () => {
	const data = getValidRequest();
	data.sort_field = "invalid_column";
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Sort field not found"));
});

test(`Error when sort direction is invalid`, async () => {
	const data = getValidRequest();
	data.sort_direction = "C";
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Invalid sort direction"));
});

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	data.sort_direction = "D";
	ctx.doAppQuery = () => {
		return { rows: [{ _count_: 1 }], rowCount: 1 };
	};
	expect(await schoolGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({ data: [{ _count_: 1 }], unfiltered_count: 1 });
});

test(`Invalid offset value as "123" provided`, async () => {
	const data = getValidRequest();
	data.limit = "123";
	expect(await schoolGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit invalid`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as -1 provided`, async () => {
	const data = getValidRequest();
	data.limit = -1;
	expect(await schoolGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit must be positive`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as 0 provided`, async () => {
	const data = getValidRequest();
	data.limit = 0;
	expect(await schoolGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit must be positive`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as "123" provided`, async () => {
	const data = getValidRequest();
	data.offset = "123";
	expect(await schoolGetAll(data, ctx)).toEqual(new Error(`400 ::: Offset invalid`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as -1 provided`, async () => {
	const data = getValidRequest();
	data.offset = -1;
	expect(await schoolGetAll(data, ctx)).toEqual(new Error(`400 ::: Offset must not be negative`));
	expect(ctx.body).toBeNull();
});

test(`return success result when no limit and offset provided with user cla-admin role`, async () => {
	const data = getValidRequest();
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: schoolResult,
			};
		}
	};
	delete data.limit;
	delete data.offset;
	expect(await schoolGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: schoolResult,
		unfiltered_count: 2,
	});
});

test(`Success when user pass query params null`, async () => {
	const data = getValidRequest();
	data.query = null;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: schoolResult,
			};
		}
	};
	expect(await schoolGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: schoolResult,
		unfiltered_count: 2,
	});
});

test(`Error when user pass wrong query params`, async () => {
	const data = getValidRequest();
	data.query = 123;
	expect(await schoolGetAll(data, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Success when user pass query params string`, async () => {
	const data = getValidRequest();
	data.query = "School";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: schoolResult,
			};
		}
	};
	expect(await schoolGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: schoolResult,
		unfiltered_count: 2,
	});
});

test(`Error when user pass invalid filter params`, async () => {
	const data = getValidRequest();
	data.filter = [];
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));

	data.filter = "ABC";
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass invalid territory filter params`, async () => {
	const data = getValidRequest();
	data.filter = {
		territory: "abc",
	};
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Invalid territory provided"));
});

test(`Error when user pass invalid institutions_level filter params`, async () => {
	const data = getValidRequest();
	data.filter = {
		school_level: "abc",
	};
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Invalid institutions level provided"));
});

test(`Error when user pass invalid school_type filter params`, async () => {
	const data = getValidRequest();
	data.filter = {
		school_type: "abc",
	};
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Invalid institutions type provided"));
});

test(`Error when user pass too many filters`, async () => {
	const data = getValidRequest();
	data.filter = {
		territory: ["england"],
		school_level: ["nursery"],
		school_type: ["academy"],
		schools: ["abc"],
		schoolsA: ["abc"],
	};
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Too many filters provided"));
});

test(`Error when user pass filter territory as wrong value`, async () => {
	const data = getValidRequest();
	data.filter = {
		territory: ["abc"],
	};
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: Territory not found"));
});

test(`Error when user pass filter school_level as wrong value`, async () => {
	const data = getValidRequest();
	data.filter = {
		territory: ["england"],
		school_level: ["abc"],
		schools: ["abc"],
	};
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: School level not found"));
});

test(`Error when user pass filter school_level as wrong value`, async () => {
	const data = getValidRequest();
	data.filter = {
		territory: ["england"],
		school_level: ["nursery"],
		school_type: ["abc"],
	};
	expect(await schoolGetAll(data)).toEqual(new Error("400 ::: School type not found"));
});

test(`Success when user pass filter as valid values `, async () => {
	const data = getValidRequest();
	data.filter = {
		territory: ["england"],
		school_level: ["nursery"],
		school_type: ["academy"],
	};
	data.query = "School";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: schoolResult,
			};
		}
	};
	expect(await schoolGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: schoolResult,
		unfiltered_count: 2,
	});
});

test(`when with_rollover_job is passed`, async () => {
	const data = getValidRequest();
	data.with_rollover_job = true;
	data.rollover_job_id = 1;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: schoolResult,
			};
		}
		if (query.indexOf("rollover_job") !== -1) {
			return { rows: [{ count: 2 }] };
		}
	};
	expect(await schoolGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({
		data: schoolResult,
		unfiltered_count: 2,
	});
});

test(`when no school is associated with given rollover id`, async () => {
	const data = getValidRequest();
	data.with_rollover_job = true;
	data.rollover_job_id = 1;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: schoolResult,
			};
		}
		if (query.indexOf("rollover_job") !== -1) {
			return { rows: [{ count: 0 }] };
		}
	};
	expect(await schoolGetAll(data)).toEqual(null);
	expect(ctx.body).toEqual({
		data: schoolResult,
		unfiltered_count: 2,
	});
});
