const addDummyExtractAccessesRaw = require("../../core/admin/add-dummy-extract-accesses");
const context = require("../common/Context");

let ctx;

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
	mockResultExtractShare = {
		rows: [
			{
				asset_id: 507,
				extract_id: 300,
				title_of_work: "unnamed share link",
			},
		],
		rowCount: 1,
	};
	ctx.getUserRole = defaultGetUserRole("cla-admin");
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("FROM extract_access") !== -1) {
			return true;
		}
		if (trimQuery.indexOf("FROM extract_share") !== -1) {
			return mockResultExtractShare;
		}
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

/** Common function */
function defaultGetUserRole(role) {
	return function () {
		return new Promise((resolve, reject) => {
			resolve(role);
		});
	};
}

async function addDummyExtractAccesses(data) {
	let err = null;
	try {
		ctx.body = await addDummyExtractAccessesRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		number_of_accesses: 3,
		date_from: "2020-10-28",
		date_to: "2020-11-28",
		oid: "eda1c0f1ca33f9554f46aaefc84914776042",
	};
}

test(`Error when user is not cla-admin`, async () => {
	const params = getParams();
	ctx.getUserRole = defaultGetUserRole("teacher");
	const res = await addDummyExtractAccesses(params);
	expect(res).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when Extract Share OID not valid`, async () => {
	const params = getParams();
	params.oid = "1457896325123";
	const res = await addDummyExtractAccesses(params);
	expect(res).toEqual(new Error("400 ::: Extract Share OID not valid"));
});

test(`Error when From date is after to date`, async () => {
	const params = getParams();
	params.date_from = "2020-11-28";
	params.date_to = "2020-10-28";
	const res = await addDummyExtractAccesses(params);
	expect(res).toEqual(new Error("From date must not be after to date ::: undefined"));
});

test(`Error when Number of accesses exceed 100`, async () => {
	const params = getParams();
	params.number_of_accesses = 101;
	const res = await addDummyExtractAccesses(params);
	expect(res).toEqual(new Error("Number of accesses may not exceed 100 ::: undefined"));
});

test(`Error when gets 0 rows of extract details`, async () => {
	mockResultExtractShare.rowCount = 0;
	const params = getParams();
	const res = await addDummyExtractAccesses(params);
	expect(res).toEqual(new Error("No matching extract share found ::: undefined"));
});

test(`Returns result Successfully`, async () => {
	const params = getParams();
	expect(await addDummyExtractAccesses(params)).toBeNull();
	expect(ctx.body).toEqual({
		success: true,
	});
});
