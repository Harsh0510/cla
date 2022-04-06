const userGetFiltersRaw = require("../../core/auth/user-get-filters");
const Context = require("../common/Context");

let ctx, data;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	data = getValidRequest();
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

const resultForSchoolAdmin = {
	result: [
		{
			id: "roles",
			title: "Roles",
			data: [
				{ id: "teacher", title: "User" },
				{ id: "school-admin", title: "Institution Admin" },
			],
		},
		{
			id: "status",
			title: "Status",
			data: [
				{
					id: "unverified",
					title: "Unverified",
				},
				{
					id: "pending",
					title: "Pending",
				},
				{
					id: "approved",
					title: "Approved",
				},
			],
		},
	],
};

const resultForClaAdmin = {
	result: [
		{
			id: "roles",
			title: "Roles",
			data: [
				{ id: "teacher", title: "User" },
				{ id: "cla-admin", title: "CLA Admin" },
				{ id: "school-admin", title: "Institution Admin" },
			],
		},
		{
			id: "status",
			title: "Status",
			data: [
				{ id: "unverified", title: "Unverified" },
				{ id: "pending", title: "Pending" },
				{ id: "approved", title: "Approved" },
			],
		},
		{
			id: "schools",
			title: "Institutions",
			data: [{ id: 1, title: "institution A" }],
		},
	],
};

async function userGetFilters(data) {
	let err = null;
	try {
		ctx.body = await userGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getValidRequest() {
	return {};
}

test(`Error when user not logged in`, async () => {
	ctx.sessionData = null;
	expect(await userGetFilters(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`An unexpected error has occurred`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter_schools = [1];
	ctx.doAppQuery = (query, values) => {
		throw new Error("Unknow error");
	};
	expect(await userGetFilters(data)).toEqual(new Error("500 ::: An unexpected error has occurred"));
});

test(`Success when user with school-admin`, async () => {
	ctx.sessionData.user_role = "school-admin";
	expect(await userGetFilters(data)).toBeNull();
	expect(ctx.body).toEqual(resultForSchoolAdmin);
});

test(`Success when user with cla-admin`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter_schools = [1];
	ctx.doAppQuery = (query, values) => {
		if (query.includes("name AS title")) {
			return { rows: [{ id: 1, title: "institution A" }] };
		}
	};
	expect(await userGetFilters(data)).toBeNull();
	expect(ctx.body).toEqual(resultForClaAdmin);
});

test(`Test when filter_schools is absent`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	data.filter_schools = null;
	expect(await userGetFilters(data)).toBeNull();
	expect(ctx.body).toEqual({
		result: [
			{
				id: "roles",
				title: "Roles",
				data: [
					{ id: "teacher", title: "User" },
					{ id: "cla-admin", title: "CLA Admin" },
					{ id: "school-admin", title: "Institution Admin" },
				],
			},
			{
				data: [
					{ id: "unverified", title: "Unverified" },
					{ id: "pending", title: "Pending" },
					{ id: "approved", title: "Approved" },
				],
				id: "status",
				title: "Status",
			},
			{
				data: [],
				id: "schools",
				title: "Institutions",
			},
		],
	});
});
