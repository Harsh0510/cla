const getSchoolsRaw = require("../../core/auth/get-schools.js");
const Context = require("../common/Context");

let ctx, rows;

/** Mock of getSchoolRecords */
jest.mock("../../core/auth/common/performSchoolSearch", () => {
	return function (ctx, params, control) {
		if (control) {
			return mockPerformSchoolSearchMock1;
		} else {
			return mockPerformSchoolSearchMock2;
		}
	};
});

function resetAll() {
	ctx = new Context();
	mockPerformSchoolSearchMock1 = {
		foundResults: true,
		schoolRecords: {
			result: {
				rowCount: 1,
				rows: [
					{
						id: 23218,
						name: "Barlby Bridge Community Primary School",
						address1: "Thomas Street",
						address2: "Barlby Road",
						city: "Selby",
						post_code: "YO8 5AA",
						labelvalue: "Barlby Bridge Community Primary School Selby , YO8 5AA",
					},
				],
			},
		},
	};
	rows = mockPerformSchoolSearchMock1.schoolRecords.result.rows;
	mockPerformSchoolSearchMock2 = {
		foundResults: false,
		rows: rows,
	};
}

/** Clear everything before and after each test */
beforeEach(resetAll);
afterEach(resetAll);

async function getSchools(data) {
	let err = null;
	try {
		ctx.body = await getSchoolsRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when invalid domain name provided`, async () => {
	let params = { domain: ["test"] };
	expect(await getSchools(params, ctx)).toEqual(new Error("400 ::: Domain invalid"));
	expect(ctx.body).toBeNull();
});

test(`Error when invalid flag is provided`, async () => {
	let params = {
		partial_postcode_search: "1",
	};
	expect(await getSchools(params, ctx)).toEqual(new Error("400 ::: Invalid flag"));
	expect(ctx.body).toBeNull();
});

test(`Error when invalid flag is provided`, async () => {
	let params = {
		full_postcode_search: "1",
	};
	expect(await getSchools(params, ctx)).toEqual(new Error("400 ::: Invalid flag"));
	expect(ctx.body).toBeNull();
});

test(`Error when invalid flag is provided`, async () => {
	let params = {
		include_extra_data: "true",
	};
	expect(await getSchools(params, ctx)).toEqual(new Error("400 ::: Invalid flag"));
	expect(ctx.body).toBeNull();
});

test(`Success`, async () => {
	let params = {};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`Success when domain from disallowedApprovedDomains`, async () => {
	let params = {
		domain: "gmail.com",
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`Success when domain not from disallowedApprovedDomains`, async () => {
	let params = {
		domain: "alexaschool.com",
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`Success when include_extra_data flag is not provided`, async () => {
	let params = {
		domain: "alexaschool.com",
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`Success with extra details when include_extra_data flag is true`, async () => {
	let params = {
		domain: "alexaschool.com",
		include_extra_data: true,
		partial_postcode_search: true,
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`Success with extra details when include_extra_data flag is true`, async () => {
	let params = {
		domain: "alexaschool.com",
		include_extra_data: true,
		full_postcode_search: true,
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`Error when invalid query`, async () => {
	let params = {
		domain: "alexaschool.com",
		include_extra_data: true,
		query: { query: "tests" },
		full_postcode_search: true,
	};
	expect(await getSchools(params, ctx)).toEqual(new Error("400 ::: Query invalid"));
	expect(ctx.body).toBeNull();
});

test(`Success when valid query`, async () => {
	let params = {
		domain: "alexaschool.com",
		include_extra_data: true,
		query: "tests",
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`Success when only include_extra_data flag`, async () => {
	let params = {
		include_extra_data: true,
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`Success with retirve all schools when valid domain and domain on change but not getting the data with current domain`, async () => {
	let params = {
		domain: "alexaschool.com",
		include_extra_data: true,
		default_result: true,
		domainHasChanged: true,
		query: "tests",
		limit: 10,
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`Success with retirve all schools when valid domain but not getting the data with current domain`, async () => {
	let params = {
		domain: "alexaschool.com",
		include_extra_data: true,
		default_result: true,
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: rows,
	});
});

test(`test when performSchoolSearch does not found result`, async () => {
	mockPerformSchoolSearchMock1.foundResults = false;
	let params = {
		domain: "alexaschool.com",
		include_extra_data: true,
		default_result: true,
		domainHasChanged: true,
		query: "tests",
		limit: 10,
	};
	expect(await getSchools(params, ctx)).toBeNull();
	expect(ctx.body).toEqual({
		result: [],
	});
});
