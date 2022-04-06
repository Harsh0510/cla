const isDomainMapSchoolRaw = require("../../core/auth/get-is-domain-mapped-with-school");
const Context = require("../common/Context");

let ctx;

function resetAll() {
	ctx = new Context();
}

/** Clear everything before and after each test */
beforeEach(resetAll);
afterEach(resetAll);

async function isDomainMapSchool(data) {
	let err = null;
	try {
		ctx.body = await isDomainMapSchoolRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return {
		email: "sagar@cla.co.uk",
		school: 9,
	};
}

test("no email provided", async () => {
	const params = getParams();
	delete params.email;
	expect(await isDomainMapSchool(params)).toEqual(new Error("400 ::: Email not provided"));
});

test("invalid email data type provided", async () => {
	const params = getParams();
	params.email = ["an array should not be allowed", "another element"];
	expect(await isDomainMapSchool(params)).toEqual(new Error("400 ::: Email invalid"));
});

test("invalid institution as string provided", async () => {
	const params = getParams();
	params.school = ["an array should not be allowed", "another element"];
	expect(await isDomainMapSchool(params)).toEqual(new Error("400 ::: Institution invalid"));
});
test("invalid institution as negative provided ", async () => {
	const params = getParams();
	params.school = -1;
	expect(await isDomainMapSchool(params)).toEqual(new Error("400 ::: Institution must be positive"));
	expect(ctx.body).toBeNull();
});

test("Successfully return result ", async () => {
	const params = getParams();
	params.school = -1;
	expect(await isDomainMapSchool(params)).toEqual(new Error("400 ::: Institution must be positive"));
	expect(ctx.body).toBeNull();
});

test("sucess with quesry result and sendVerifyEmail", async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("FROM approved_domain") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		throw new Error("should never get here");
	};
	expect(await isDomainMapSchool(params)).toBeNull();
	expect(ctx.body).toEqual({
		result: false,
	});
});
