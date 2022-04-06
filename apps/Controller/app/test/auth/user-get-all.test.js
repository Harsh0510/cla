const userGetAllRaw = require("../../core/auth/user-get-all");
const Context = require("../common/Context");

let ctx, data;
let userResults;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	data = {
		limit: 10,
		offset: 0,
		sort_field: "first_name",
		sort_direction: "A",
		query: "school",
	};
	userResults = [
		{
			school_id: 3,
			school_name: "test school",
			title: "Mr",
			first_name: "afa7name",
			last_name: "ala7name",
			email: "admina1@email.com",
			is_pending_approval: false,
			is_activated: true,
			role: "school-admin",
		},
		{
			school_id: 3,
			school_name: "test school",
			title: "Mr",
			first_name: "afa7name",
			last_name: "ala7name",
			email: "admina1@email.com",
			is_pending_approval: false,
			is_activated: true,
			role: "school-admin",
		},
	];
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function userGetAll(data) {
	let err = null;
	try {
		ctx.body = await userGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`no sort_direction provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	delete data.sort_direction;
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Sort Direction not provided`));
	expect(ctx.body).toBeNull();
});

test(`Error Unauthorized when user role as teacher`, async () => {
	ctx.sessionData.user_role = "teacher";
	expect(await userGetAll(data, ctx)).toEqual(new Error(`401 ::: Unauthorized`));
	expect(ctx.body).toBeNull();
});

test(`Error Unauthorized when user role invalid`, async () => {
	ctx.sessionData.user_role = "test";
	expect(await userGetAll(data, ctx)).toEqual(new Error(`401 ::: Unauthorized`));
	expect(ctx.body).toBeNull();
});

test(`no sort_field provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	delete data.sort_field;
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Sort field not found`));
	expect(ctx.body).toBeNull();
});

test(`Invalid sort_field provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.sort_field = "123";
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Sort field not found`));
	expect(ctx.body).toBeNull();
});

test(`Invalid sort_direction provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.sort_direction = "test";
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Invalid sort direction`));
	expect(ctx.body).toBeNull();
});

test(`Invalid pending status provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.pending_status = "test pending status";
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Unknown pending status`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as "123" provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.offset = "123";
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Offset invalid`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as -1 provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.offset = -1;
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Offset must not be negative`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as "123" provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.limit = "123";
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit invalid`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as -1 provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.limit = -1;
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit must be positive`));
	expect(ctx.body).toBeNull();
});

test(`Invalid offset value as 0 provided`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.limit = 0;
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Limit must be positive`));
	expect(ctx.body).toBeNull();
});

test(`Return NULL when no session data found`, async () => {
	ctx.sessionData = null;
	expect(await userGetAll(data, ctx)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test(`return success result with user cla-admin role`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: userResults,
			};
		}
	};
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: userResults,
		unfiltered_count: 2,
	});
});

test(`return success result when no limit and offset provided with user cla-admin role`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: userResults,
			};
		}
	};
	delete data.limit;
	delete data.offset;
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: userResults,
		unfiltered_count: 2,
	});
});

test(`return success result when sort direction as D provided with user cla-admin role`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: userResults,
			};
		}
	};
	data.sort_direction = "D";
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: userResults,
		unfiltered_count: 2,
	});
});

test(`return success result with user school-admin role`, async () => {
	ctx.sessionData.user_role = "school-admin";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: userResults,
			};
		}
	};
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: userResults,
		unfiltered_count: 2,
	});
});

test(`return success result with user school-admin role`, async () => {
	ctx.sessionData.user_role = "school-admin";
	data.pending_status = "only_pending";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: userResults,
			};
		}
	};
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: userResults,
		unfiltered_count: 2,
	});
});

test(`return error when trigger count(*) sql query`, async () => {
	ctx.sessionData.user_role = "school-admin";
	data.pending_status = "only_pending";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			throw new Error("Unknown error");
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: userResults,
			};
		}
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Unknown error"));
	expect(ctx.body).toBeNull();
});

test(`return error when trigger rows result sql query`, async () => {
	ctx.sessionData.user_role = "school-admin";
	data.pending_status = "only_pending";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			throw new Error("Unknown error");
		}
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Unknown error"));
	expect(ctx.body).toBeNull();
});

test(`Success when user pass query params null`, async () => {
	data.query = null;
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: userResults,
			};
		}
	};
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: userResults,
		unfiltered_count: 2,
	});
});

test(`Error when user pass wrong query params`, async () => {
	data.query = 123;
	expect(await userGetAll(data, ctx)).toEqual(new Error(`400 ::: Query invalid`));
});

test(`Success when user pass query params string`, async () => {
	data.query = "School";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 2 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: userResults,
			};
		}
	};
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: userResults,
		unfiltered_count: 2,
	});
});

test(`Success when user pass query params string and No result founds`, async () => {
	data.query = "School";
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: null };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: [],
			};
		}
	};
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: [],
		unfiltered_count: undefined,
	});
});

test(`Error when user pass invalid filter`, async () => {
	data.query = "School";
	data.filter = [];
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));

	data.filter = "ABC";
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass invalid institution in filter`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.query = "School";
	data.filter = {
		schools: ["a", "b", "c"],
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Institution id invalid"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass invalid role in filter`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.query = "School";
	data.filter = {
		roles: ["admin"],
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: User role not found"));
	expect(ctx.body).toBeNull();
});

test(`Error when pass too many filter with cla-admin`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.query = "School";
	data.filter = {
		schools: [1, 2, 3],
		roles: ["cla-admin"],
		schoolsA: [1, 2, 3],
		rolesA: ["cla-admin"],
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Too many filters provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when pass too many filter with school-admin`, async () => {
	ctx.sessionData.user_role = "school-admin";
	data.filter = {
		schools: [1, 2, 3],
		roles: ["cla-admin"],
		status: ["approved"],
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Too many filters provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when school-admin user filter with cla-admin role`, async () => {
	ctx.sessionData.user_role = "school-admin";
	data.filter = {
		roles: ["cla-admin"],
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: User role not found"));
	expect(ctx.body).toBeNull();
});

test(`Success when user pass valid filter params`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.query = "School";
	data.filter = {
		schools: [1, 2],
		roles: ["school-admin"],
		status: ["pending", "approved"],
	};
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: [],
			};
		}
	};
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: [],
		unfiltered_count: 0,
	});
});

test(`Success when user pass filter params as blank`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter = {
		schools: [],
		roles: [],
	};
	ctx.appDbQuery = async function (query, values) {
		if (query.indexOf("COUNT(*)") !== -1) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.indexOf("ORDER BY") !== -1) {
			return {
				rows: [],
			};
		}
	};
	expect(await userGetAll(data)).toBeNull();
	expect(ctx.body).toEqual({
		data: [],
		unfiltered_count: 0,
	});
});

test(`Error when user pass filter params role as string`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter = {
		schools: "123",
		roles: "cla-admin",
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Invalid roles provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass filter params school as string`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter = {
		schools: "123",
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Invalid schools provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass invalid Status type filter`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter = {
		status: "approved",
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Invalid Status provided"));
	expect(ctx.body).toBeNull();
});

test(`Error when user pass invalid Status in filter`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter = {
		schools: [1, 2],
		status: ["approved", "pen"],
	};
	expect(await userGetAll(data)).toEqual(new Error("400 ::: Invalid Status provided"));
	expect(ctx.body).toBeNull();
});
