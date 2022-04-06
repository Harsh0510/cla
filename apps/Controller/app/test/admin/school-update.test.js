const schoolUpdateRaw = require("../../core/admin/school-update");
const Context = require("../common/Context");

let ctx;
let mockSelectResult;
let mockSelectIdentifierResult;
let mockUpdateResult;
let mockIsIncludeModifyUserId;
let mockIsIncludeDateEdited;

function getValidRequest() {
	return {
		id: 1,
		identifier: "A/TS/C",
		name: "Test School",
		address1: "375 City Road",
		address2: "Angel",
		city: "London",
		county: "Greater London",
		post_code: "EC1V 1NB",
		territory: "england",
		local_authority: "Islington",
		school_level: "first",
		school_type: "academy",
		school_home_page: "https://tvf.co.uk",
		number_of_students: 60,
		enable_wonde_user_sync: true,
		enable_wonde_class_sync: true,
		gsg: "A",
		dfe: "TS",
		seed: "C",
		nide: "nide",
		hwb_identifier: "hwb",
	};
}

function resetAll() {
	ctx = new Context();

	mockSelectResult = {
		rows: [
			{
				can_edit: true,
			},
		],
		rowCount: 1,
	};
	mockSelectIdentifierResult = {
		rows: [
			{
				school_identifier: "A/TS/C",
			},
		],
		rowCount: 1,
	};

	mockUpdateResult = { rows: [], rowCount: 1 };
	ctx.doAppQuery = (query) => {
		if (query.includes("AS can_edit")) {
			return mockSelectResult;
		} else if (query.includes("identifier AS school_identifier")) {
			return mockSelectIdentifierResult;
		} else if (query.includes("UPDATE")) {
			mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
			mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
			return mockUpdateResult;
		}
	};
	mockIsIncludeModifyUserId = false;
	mockIsIncludeDateEdited = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function schoolUpdate(data, sendEmail) {
	let err = null;
	try {
		ctx.body = await schoolUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = null;
	expect(await schoolUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("logged in as teacher", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await schoolUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("error when school id is not the valid type", async () => {
	const data = getValidRequest();
	data.id = "1"; // should be number
	expect(await schoolUpdate(data)).toEqual(new Error("400 ::: ID invalid"));
	expect(ctx.body).toBeNull();
});

test("error when no fields are changed", async () => {
	const data = {
		id: 1,
	};
	expect(await schoolUpdate(data)).toEqual(new Error("400 ::: No fields changed"));
	expect(ctx.body).toBeNull();
});

test("Error if name is an empty string", async () => {
	const data = getValidRequest();
	data.name = "";
	expect(await schoolUpdate(data)).toEqual(new Error("400 ::: Name not provided"));
});

test("Error if address1 is an empty string", async () => {
	const data = getValidRequest();
	data.address1 = "";
	expect(await schoolUpdate(data)).toEqual(new Error("400 ::: Address (1) not provided"));
});

test("Error if city is an empty string", async () => {
	const data = getValidRequest();
	data.city = "";
	expect(await schoolUpdate(data)).toEqual(new Error("400 ::: Town/City not provided"));
});

test("Error if post_code is an empty string", async () => {
	const data = getValidRequest();
	data.post_code = "";
	expect(await schoolUpdate(data)).toEqual(new Error("400 ::: Post Code not provided"));
});

test("Error if institution_level is an empty string", async () => {
	const data = getValidRequest();
	data.school_level = "";
	expect(await schoolUpdate(data)).toEqual(new Error("400 ::: Institution Level not provided"));
});

test("Error if number_of_students is an invalid integer", async () => {
	const data = getValidRequest();
	data.number_of_students = -3;
	expect(await schoolUpdate(data)).toEqual(new Error("400 ::: Number of Students must not be negative"));
});

test("Error if the institution is not found in the database", async () => {
	const data = getValidRequest();
	mockUpdateResult = { rows: [], rowCount: 0 };
	expect(await schoolUpdate(data)).toEqual(new Error("400 ::: Institution not found"));
});

test("Error when unknown sql error occurs", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query) => {
		if (query.includes("AS can_edit")) {
			return mockSelectResult;
		}
		throw new Error("Some error here");
	};
	expect(await schoolUpdate(data)).toEqual(new Error("Some error here"));
});

test("School is successfully updated when county in an empty string", async () => {
	const data = getValidRequest();
	data.county = "";
	expect(await schoolUpdate(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("School is successfully updated when local authority in an empty string", async () => {
	const data = getValidRequest();
	data.local_authority = "";
	expect(await schoolUpdate(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("School is successfully updated", async () => {
	const data = getValidRequest();
	expect(await schoolUpdate(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("School is successfully updated when enable_wonde_user_sync is checked", async () => {
	const data = getValidRequest();
	data.enable_wonde_user_sync = true;
	expect(await schoolUpdate(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when An institution with that name already exists`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query) => {
		if (query.includes("AS can_edit")) {
			return mockSelectResult;
		}
		if (query.includes("identifier AS school_identifier")) {
			return mockSelectIdentifierResult;
		}
		if (query.includes("UPDATE")) {
			throw new Error(`value 'foo' violates unique constraint on "school_name_key" `);
		}
	};
	expect(await schoolUpdate(data)).toEqual(new Error(`400 ::: An institution with that name already exists`));
});

test(`Error when institution with that identifier already exists`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query) => {
		if (query.includes("AS can_edit")) {
			return mockSelectResult;
		}
		if (query.includes("identifier AS school_identifier")) {
			return mockSelectIdentifierResult;
		}
		if (query.includes("UPDATE")) {
			throw new Error(`value 'foo' violates unique constraint on "school_identifier_key" `);
		}
	};
	expect(await schoolUpdate(data)).toEqual(new Error(`400 ::: An institution with that identifier already exists`));
});

test(`Error when An institution with those details already exists`, async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query) => {
		if (query.includes("AS can_edit")) {
			return mockSelectResult;
		}
		if (query.includes("identifier AS school_identifier")) {
			return mockSelectIdentifierResult;
		}
		if (query.includes("UPDATE")) {
			throw new Error(`violates unique constraint `);
		}
	};
	expect(await schoolUpdate(data)).toEqual(new Error(`400 ::: An institution with those details already exists`));
});

test("School is successfully updated when gsg identifier is an empty string", async () => {
	const data = getValidRequest();
	data.gsg = "";
	expect(await schoolUpdate(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("School is successfully updated when dfe identifier is an empty string", async () => {
	const data = getValidRequest();
	data.dfe = "";
	expect(await schoolUpdate(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("School is successfully updated when seed identifier is an empty string", async () => {
	const data = getValidRequest();
	data.seed = "";
	expect(await schoolUpdate(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("Ensure modified_by_user_id and date_edited updated successfully in database", async () => {
	const data = getValidRequest();
	expect(await schoolUpdate(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeModifyUserId).toEqual(true);
	expect(mockIsIncludeDateEdited).toEqual(true);
});
