const schoolCreateRaw = require("../../core/admin/school-create.js");
const Context = require("../common/Context");

let ctx, queryResult, endpointResult_Success;

function getValidRequest() {
	return {
		id: 1,
		identifier: "TS",
		name: "Test School",
		address1: "375 City Road",
		address2: "Angel",
		city: "London",
		county: "Greater London",
		post_code: "EC1V 1NB",
		territory: "england",
		local_authority: "Islington",
		school_level: "nursery",
		school_type: "academy",
		school_home_page: "https://tvf.co.uk",
		number_of_students: 60,
	};
}

function resetAll() {
	ctx = new Context();
	queryResult = {
		rowCount: 1,
		rows: [{ id: 1 }],
	};
	endpointResult_Success = { success: true, school_id: 1 };
}

beforeEach(resetAll);
afterEach(resetAll);

async function schoolCreate(data) {
	let err = null;
	try {
		ctx.body = await schoolCreateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when school name not provided`, async () => {
	const data = getValidRequest();
	delete data.name;
	expect(await schoolCreate(data)).toEqual(new Error("400 ::: Name not provided"));
});

test(`Error when provided school name is not a string`, async () => {
	const data = getValidRequest();
	data.name = 111;
	expect(await schoolCreate(data)).toEqual(new Error("400 ::: Name invalid"));
});

test("Error if name is an empty string", async () => {
	const data = getValidRequest();
	data.name = "";
	expect(await schoolCreate(data)).toEqual(new Error("400 ::: Name not provided"));
});

test("Error if address1 is an empty string", async () => {
	const data = getValidRequest();
	data.address1 = "";
	expect(await schoolCreate(data)).toEqual(new Error("400 ::: Address (1) not provided"));
});

test("Error if city is an empty string", async () => {
	const data = getValidRequest();
	data.city = "";
	expect(await schoolCreate(data)).toEqual(new Error("400 ::: Town/City not provided"));
});

test("Error if post_code is an empty string", async () => {
	const data = getValidRequest();
	data.post_code = "";
	expect(await schoolCreate(data)).toEqual(new Error("400 ::: Post Code not provided"));
});

test("Error if institution_level is an empty string", async () => {
	const data = getValidRequest();
	data.school_level = "";
	expect(await schoolCreate(data)).toEqual(new Error("400 ::: Institution Level not provided"));
});

test("Error if number_of_students is an invalid integer", async () => {
	const data = getValidRequest();
	data.number_of_students = -3;
	expect(await schoolCreate(data)).toEqual(new Error("400 ::: Number of Students must not be negative"));
});

test(`Error when provided institution name already exists in database`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = () => {
		throw new Error(`value 'foo' violates unique constraint on 'name'`);
	};
	expect(await schoolCreate(data)).toEqual(new Error(`400 ::: An institution with those details already exists`));
});

test(`Error when provided institution name already exists in database`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = () => {
		throw new Error(`value 'foo' violates unique constraint on "school_identifier_key" `);
	};
	expect(await schoolCreate(data)).toEqual(new Error(`400 ::: An institution with that identifier already exists`));
});

test(`Error when an unexpected database error occurs`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = () => {
		throw new Error(`OH NO, IT'S AN UNEXPECTED ERROR!`);
	};
	expect(await schoolCreate(data)).toEqual(new Error(`500 ::: Error creating institution [2]`));
});

test(`Successful creation when county is not specified`, async () => {
	const data = getValidRequest();
	data.county = "";
	ctx.doAppQuery = (query) => {
		return queryResult;
	};
	expect(await schoolCreate(data)).toBeNull();
	expect(ctx.body).toEqual(endpointResult_Success);
});

test(`Successful creation when local authority is not specified`, async () => {
	const data = getValidRequest();
	data.local_authority = "";
	ctx.doAppQuery = () => {
		return queryResult;
	};
	expect(await schoolCreate(data)).toBeNull();
	expect(ctx.body).toEqual(endpointResult_Success);
});

test(`Successful creation when local authority is not specified`, async () => {
	const data = getValidRequest();
	data.local_authority = "";
	ctx.doAppQuery = () => {
		return queryResult;
	};
	expect(await schoolCreate(data)).toBeNull();
	expect(ctx.body).toEqual(endpointResult_Success);
});

test(`Successful creation`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = () => {
		return queryResult;
	};
	expect(await schoolCreate(data)).toBeNull();
	expect(ctx.body).toEqual(endpointResult_Success);
});

test(`Error when An institution with that name already exists`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = () => {
		throw new Error(`value 'foo' violates unique constraint on "school_name_key" `);
	};
	expect(await schoolCreate(data)).toEqual(new Error(`400 ::: An institution with that name already exists`));
});

test(`Successful creation when school type not specified`, async () => {
	const data = getValidRequest();
	data.school_type = "";
	ctx.doAppQuery = () => {
		return queryResult;
	};
	expect(await schoolCreate(data)).toBeNull();
	expect(ctx.body).toEqual(endpointResult_Success);
});

test(`Successful creation when school home page not specified`, async () => {
	const data = getValidRequest();
	data.school_home_page = "";
	ctx.doAppQuery = () => {
		return queryResult;
	};
	expect(await schoolCreate(data)).toBeNull();
	expect(ctx.body).toEqual(endpointResult_Success);
});

test(`Successful creation when number of students not specified`, async () => {
	const data = getValidRequest();
	data.number_of_students = "";
	ctx.doAppQuery = () => {
		return queryResult;
	};
	expect(await schoolCreate(data)).toBeNull();
	expect(ctx.body).toEqual(endpointResult_Success);
});
