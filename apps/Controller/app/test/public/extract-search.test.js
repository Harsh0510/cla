const extractSearchRaw = require("../../core/public/extract-search");
const Context = require("../common/Context");

let ctx, sort_field, sort_dir, mockExtractAccessCodeResult, mockGetCookies;

async function getGoodAmmDbQuery(query, values) {
	query = query.trim().replace(/\s+/g, " ");
	if (query.indexOf("_count_") !== -1) {
		return {
			rows: [{ _count_: 3 }],
		};
	} else if (query.indexOf("LIMIT") !== -1) {
		expect(query.indexOf("LIMIT")).not.toBeNull();
	} else if (query.indexOf("SELECT enable_extract_share_access_code, access_code FROM extract_share WHERE oid = $1") !== -1) {
		return mockExtractAccessCodeResult;
	}
	return {
		rows: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
	};
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new Context();
	ctx.appDbQuery = async function (query, values) {
		return await getGoodAmmDbQuery(query, values);
	};
	sort_field = "title";
	sort_dir = "A";
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.academic_year_end = [9, 20];
	mockGetCookies = undefined;
	ctx._koaCtx = {
		request: {
			socket: {
				setTimeout: () => {},
			},
		},
		cookies: {
			set: () => {},
			get: () => {
				return mockGetCookies;
			},
		},
	};
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: false,
				access_code: null,
			},
		],
	};
	ctx.setCookie = () => {
		return;
	};
}

jest.fn("../getArrayCookieValue");

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractSearch(data) {
	let err = null;
	try {
		ctx.body = await extractSearchRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		limit: 3,
		offset: 0,
		page_count: 3,
		title: "english",
		year: 2019,
		course_name: "",
		mine_only: 0,
		order_by: [sort_field, sort_dir],
		course_name: "maths",
		work_isbn13: "1234561234561",
		extract_oid: "f1b653667bb585e633934aab335e27ed025f",
		filter: { class: [352] },
		query: "c",
	};
}

test(`Error when requester is not a cla-admin, teacher , school admin`, async () => {
	const params = getGoodParams();
	ctx.sessionData.user_role = "superadmin";
	expect(await extractSearch(params)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test(`Error when offset pass with string value`, async () => {
	const params = getGoodParams();
	params.offset = "10";
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Offset invalid"));
	expect(ctx.body).toEqual(null);
});

test(`Error when offset pass with nagative value`, async () => {
	const params = getGoodParams();
	params.offset = -10;
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Offset must not be negative"));
	expect(ctx.body).toEqual(null);
});

test(`Error when limit pass with string value`, async () => {
	const params = getGoodParams();
	params.limit = "10";
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Limit invalid"));
	expect(ctx.body).toEqual(null);
});

test(`Error when limit pass with negative value`, async () => {
	const params = getGoodParams();
	params.limit = -1;
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Limit must be positive"));
	expect(ctx.body).toEqual(null);
});

test(`Error when filter pass with array`, async () => {
	const params = getGoodParams();
	params.filter = ["My_school"];
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toEqual(null);
});

test(`Error when filter pass with array with object`, async () => {
	const params = getGoodParams();
	params.filter = [{ my_school: "My school" }];
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Invalid filter provided"));
	expect(ctx.body).toEqual(null);
});

test(`Error when filter pass with object`, async () => {
	const params = getGoodParams();
	params.filter = { class: { 1: 352 } };
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Invalid class provided"));
	expect(ctx.body).toEqual(null);
});

test(`Error when filter pass more than 1 when user login with cla-admin`, async () => {
	const params = getGoodParams();
	params.filter = { class: [352], class2: [52] };
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Too many filters provided"));
	expect(ctx.body).toEqual(null);
});

test(`Error when pass invalid query `, async () => {
	const params = getGoodParams();
	params.query = [];
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Query invalid"));
	expect(ctx.body).toEqual(null);
});

test(`Succeed even when no extracts are found`, async () => {
	const params = getGoodParams();
	(params.order_by = [sort_field, "D"]), delete params.offset;
	delete params.limit;
	ctx.appDbQuery = async (query, values) => ({
		rows: null,
	});
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		error: null,
		extracts: [],
		academic_year_end: [9, 20],
		unfiltered_count: 0,
	});
});

test(`Succeed even when no extracts are found and passing status as order by`, async () => {
	const params = getGoodParams();
	sort_field = "status";
	(params.order_by = [sort_field, "D"]), delete params.offset;
	delete params.limit;
	ctx.appDbQuery = async (query, values) => ({
		rows: null,
	});
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		error: null,
		extracts: [],
		academic_year_end: [9, 20],
		unfiltered_count: 0,
	});
});

test(`Succeed when extracts are found`, async () => {
	const params = getGoodParams();
	delete params.order_by;
	params.mine_only = 1;
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		academic_year_end: [9, 20],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Error when Share OID not provided by viewers`, async () => {
	ctx.sessionData = null;
	const params = getGoodParams();
	delete params.extract_share_oid;
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Share OID not provided"));
	expect(ctx.body).toEqual(null);
});

test(`Error when Invalid Share OID provided by viewers`, async () => {
	ctx.sessionData = null;
	const params = getGoodParams();
	params.extract_oid = "a".repeat(36);
	params.extract_share_oid = "23232323";
	expect(await extractSearch(params)).toEqual(new Error("400 ::: Share OID not valid"));
	expect(ctx.body).toEqual(null);
});

test(`Succeed when valid Share OID with viewers`, async () => {
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), delete params.offset;
	delete params.limit;
	params.extract_share_oid = "b".repeat(36);
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [9, 20],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Succeed when valid Share OID with cla-admin`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	ctx.sessionData.school_id = 0;
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [9, 20],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Require access code`, async () => {
	ctx.sessionData = null;
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "12345",
			},
		],
	};
	const params = {
		extract_share_oid: "b".repeat(36),
	};
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: "requireaccesscode",
	});
});

test(`Invalid Access code`, async () => {
	ctx.sessionData = null;
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "12345",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	params.access_code = "67891";
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: "invalidaccesscode",
	});
});

test(`Validate the access code and return result`, async () => {
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "12345",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	params.access_code = "12345";
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [9, 20],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Getting the null acadamic year and month from session`, async () => {
	ctx.sessionData.academic_year_end = null;
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	params.access_code = "12345";
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Pass filter as null`, async () => {
	ctx.sessionData.academic_year_end = null;
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	params.access_code = "12345";
	params.filter = null;
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Pass filter as null object`, async () => {
	ctx.sessionData.academic_year_end = null;
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	params.access_code = "12345";
	params.filter = {};
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Pass filter object class as empty array`, async () => {
	ctx.sessionData.academic_year_end = null;
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	params.access_code = "12345";
	params.filter = { class: [] };
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Pass filter object class as empty array`, async () => {
	ctx.sessionData.academic_year_end = null;
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	params.access_code = "12345";
	params.filter = { class: [] };
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Auto Validate the access code from cookies and return result`, async () => {
	mockGetCookies = "12345,56789";
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "12345",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [9, 20],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`Auto Validate the access code from cookies and return result`, async () => {
	mockGetCookies = "12345, 67891, 54321";
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "12345",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [9, 20],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`User require to pass access code for accessing the extract when cookies value as null`, async () => {
	ctx.sessionData = null;
	mockGetCookies = null;
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "12345",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: "requireaccesscode",
	});
});

test(`User require to pass access code for accessing the extract when cookies value as undefined`, async () => {
	ctx.sessionData = null;
	mockGetCookies = undefined;
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "12345",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: "requireaccesscode",
	});
});

test(`User require to pass access code for accessing the asset`, async () => {
	ctx.sessionData = null;
	mockGetCookies = '[{ "access_code": "12345" }, { "access_code": "67891" }, { "access_code": "54321" }]';
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "77778",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: "requireaccesscode",
	});
});

test(`User require can view multiple extract with auto access from cookies`, async () => {
	mockGetCookies = '[{ "access_code": "12345" }, { "access_code": "67891" }]';
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "54321",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	params.access_code = "54321";
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [9, 20],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`User require can view last three the extract with auto access from cookies`, async () => {
	mockGetCookies = '[{ "access_code": "12345" }, { "access_code": "67891" }, { "access_code": "44441" }]';
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "54321",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	params.access_code = "54321";
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [9, 20],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`When User is not loggedIn and so unable to see favorite extract list`, async () => {
	ctx.sessionData = null;
	mockGetCookies = '[{ "access_code": "12345" }, { "access_code": "67891" }, { "access_code": "44441" }]';
	mockExtractAccessCodeResult = {
		rows: [
			{
				enable_extract_share_access_code: true,
				access_code: "54321",
			},
		],
	};
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), (params.extract_share_oid = "b".repeat(36));
	delete params.mine_only;
	params.access_code = "54321";
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [8, 15],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});

test(`When user is on My copies page and clicked on Hide expiry copies checkbox`, async () => {
	const params = getGoodParams();
	params.expiry_status = "active_only";
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		error: null,
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		academic_year_end: [9, 20],
	});
});

test(`When user is on review copy page and see only his expired extracts`, async () => {
	const params = getGoodParams();
	params.expiry_status = "review_only";
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		error: null,
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		academic_year_end: [9, 20],
	});
});

test(`Succeed when valid asset_user_upload OID`, async () => {
	const params = getGoodParams();
	(params.order_by = [sort_field, "A"]), delete params.offset;
	delete params.limit;
	params.asset_user_upload_oid = "b".repeat(36);
	expect(await extractSearch(params)).toBe(null);
	expect(ctx.body).toEqual({
		academic_year_end: [9, 20],
		extracts: [{ foo: 1 }, { foo: 2 }, { foo: 5 }],
		unfiltered_count: 3,
		error: null,
	});
});
