const unlockImageUploadGetFiltersRaw = require("../../core/admin/unlock-image-upload-get-filters");
const context = require("../common/Context");

let mockResult;
let mockResult1 = {
	result: [
		{
			id: "schools",
			title: "Institutions",
			data: [
				{ id: 477, name: "St Paul's" },
				{ id: 10528, name: "Golspie High School (Golspie)" },
			],
		},
		{
			id: "status",
			title: "Status",
			data: [
				{ id: "pending", title: "Pending" },
				{ id: "awaiting", title: "Awaiting" },
				{ id: "rejected", title: "Rejected" },
				{ id: "approved", title: "Approved" },
				{ id: "approved-pending", title: "Approved (Pending)" },
			],
		},
	],
};
let mockResult2 = {
	result: [
		{
			id: "schools",
			title: "Institutions",
			data: [],
		},
		{
			id: "status",
			title: "Status",
			data: [
				{ id: "pending", title: "Pending" },
				{ id: "awaiting", title: "Awaiting" },
				{ id: "rejected", title: "Rejected" },
				{ id: "approved", title: "Approved" },
				{ id: "approved-pending", title: "Approved (Pending)" },
			],
		},
	],
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
	mockResult = {
		rows: [
			{
				id: 477,
				name: "St Paul's",
			},
			{
				id: 10528,
				name: "Golspie High School (Golspie)",
			},
		],
	};
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT") !== -1) {
			return mockResult;
		}
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/** Common function */
async function unlockImageUploadGetFilters(data) {
	let err = null;
	try {
		ctx.body = await unlockImageUploadGetFiltersRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		filter_schools: [25, 59],
	};
}

test(`Error when not login`, async () => {
	const params = getParams();
	ctx.sessionData = null;
	const res = await unlockImageUploadGetFilters(params);
	expect(res).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Successfully returns result when filter_schools is given`, async () => {
	const params = getParams();
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "cla-admin" }));
	expect(await unlockImageUploadGetFilters(params)).toBeNull();
	expect(ctx.body).toEqual(mockResult1);
});

test(`Successfully returns result when filter_schools is not given`, async () => {
	const params = getParams();
	params.filter_schools = null;
	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => resolve());
	ctx.getSessionData = (_) => new Promise((resolve, reject) => resolve({ user_role: "cla-admin" }));
	expect(await unlockImageUploadGetFilters(params)).toBeNull();
	expect(ctx.body).toEqual(mockResult2);
});
