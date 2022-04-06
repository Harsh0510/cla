const getSchoolRecords = require("../../../core/auth/common/getSchoolRecords");
const Context = require("../../common/Context");

let ctx, mockResult;

function resetAll() {
	ctx = new Context();
	mockResult = {
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
			{
				id: 23220,
				name: "Barlby Community Primary School",
				address1: "Hilltop",
				address2: "Barlby",
				city: "Selby",
				post_code: "YO8 5JQ",
				labelvalue: "Barlby Community Primary School Selby , YO8 5JQ",
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

beforeEach(resetAll);
afterEach(resetAll);

/** Common function */
async function getSchoolRecordsRaw(columns, caseColumns, whereClauses, tableJoins, limit, binds) {
	let err = null;
	try {
		ctx.body = await getSchoolRecords(ctx, columns, caseColumns, whereClauses, tableJoins, limit, binds);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		columns: [
			"school.id AS id",
			"school.name AS name",
			"school.address1 AS address1",
			"school.address2 AS address2",
			"school.city AS city",
			"school.post_code AS post_code",
		],
		caseColumns: [
			", CASE WHEN (school.city IS NULL OR TRIM(school.city) = '') THEN CONCAT(school.name,' , ', school.post_code )",
			"WHEN (school.post_code IS NULL OR TRIM(school.post_code) = '') THEN CONCAT(school.name,' , ', school.city)",
			"ELSE CONCAT(school.name,' , ',school.city,' , ', school.post_code)  END AS labelvalue",
		],
		whereClauses: ["(public_keywords @@ plainto_tsquery($1))"],
		tableJoins: [],
		limit: 25,
		binds: ["pri"],
	};
}

test(`Test when got result successfully`, async () => {
	const params = getParams();
	const res = await getSchoolRecordsRaw(params.columns, params.caseColumns, params.whereClauses, params.tableJoins, params.limit, params.binds);
	expect(res).toEqual(null);
	expect(ctx.body).toEqual({
		result: {
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
				{
					id: 23220,
					name: "Barlby Community Primary School",
					address1: "Hilltop",
					address2: "Barlby",
					city: "Selby",
					post_code: "YO8 5JQ",
					labelvalue: "Barlby Community Primary School Selby , YO8 5JQ",
				},
			],
		},
	});
});

test(`Test result successfully when some parameters are not passed`, async () => {
	const params = getParams();
	const res = await getSchoolRecordsRaw([], [], [], ["table1"], params.limit, params.binds);
	expect(res).toEqual(null);
	expect(ctx.body).toEqual({
		result: {
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
				{
					id: 23220,
					name: "Barlby Community Primary School",
					address1: "Hilltop",
					address2: "Barlby",
					city: "Selby",
					post_code: "YO8 5JQ",
					labelvalue: "Barlby Community Primary School Selby , YO8 5JQ",
				},
			],
		},
	});
});
