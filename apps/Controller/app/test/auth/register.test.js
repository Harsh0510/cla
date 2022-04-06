const registerRaw = require("../../core/auth/register.js");
const Context = require("../common/Context");

let ctx;
let mockAddDefaultClassResult = true;

function resetAll() {
	ctx = new Context();
	mockAddDefaultClassResult = true;
}

jest.mock("#tvf-util", () => {
	const tvfUtil = {
		generateObjectIdentifier: async () => "Abc@1234",
	};

	return tvfUtil;
});

jest.mock("../../core/auth/common/addDefaultClass", () => {
	return async function () {
		return mockAddDefaultClassResult;
	};
});

/** Clear everything before and after each test */
beforeEach(resetAll);
afterEach(resetAll);

async function register(data) {
	let err = null;
	try {
		ctx.body = await registerRaw(data, ctx, emailSend, async (_) => ({ hash: "ads", salt: "aege", algo: "asf" }));
	} catch (e) {
		err = e;
	}
	return err;
}

let emailSend = async (sendEmail, email, token) => {
	return true;
};

jest.mock("../../core/auth/common/sendNewVerifyEmail", () => {
	return function () {
		return true;
	};
});

jest.mock("../../core/auth/common/sendTrustedVerifyEmail", () => {
	return function () {
		return true;
	};
});

/** default params for register user */
function getParams() {
	return {
		title: "Mr",
		first_name: "firsname",
		last_name: "lastname",
		email: "abc@email.com",
		school: 1,
		job_title: "",
		terms_accepted: true,
		password: "Abc@1234",
		password_confirm: "Abc@1234",
	};
}

test("error when invalid title passed", async () => {
	const params = getParams();
	params.title = 5345;
	expect(await register(params)).toEqual(new Error("400 ::: Title invalid"));
	expect(ctx.body).toBeNull();
});

test("error when unrecognised title passed", async () => {
	const params = getParams();
	params.title = "does not exist";
	expect(await register(params)).toEqual(new Error("400 ::: Title not found"));
	expect(ctx.body).toBeNull();
});

test(`no first_name provided`, async () => {
	let params = getParams();
	delete params.first_name;
	expect(await register(params, ctx)).toEqual(new Error(`400 ::: First name not provided`));
});

test(`invalid first_name provided`, async () => {
	let params = getParams();
	params.first_name = 123;
	expect(await register(params, ctx)).toEqual(new Error(`400 ::: First name invalid`));
});

test(`invalid first_name as ["test"] provided`, async () => {
	let params = getParams();
	params.first_name = ["test"];
	expect(await register(params, ctx)).toEqual(new Error(`400 ::: First name invalid`));
});

test(`no last_name provided`, async () => {
	let params = getParams();
	delete params.last_name;
	expect(await register(params, ctx)).toEqual(new Error(`400 ::: Last name not provided`));
});

test(`invalid last_name provided`, async () => {
	let params = getParams();
	params.last_name = 123;
	expect(await register(params, ctx)).toEqual(new Error(`400 ::: Last name invalid`));
});

test(`invalid last_name as ["test"] provided`, async () => {
	let params = getParams();
	params.last_name = ["test"];
	expect(await register(params, ctx)).toEqual(new Error(`400 ::: Last name invalid`));
});

test("no email provided", async () => {
	const params = getParams();
	delete params.email;
	expect(await register(params, ctx)).toEqual(new Error("400 ::: Email not provided"));
});

test("invalid email data type provided", async () => {
	const params = getParams();
	params.email = ["an array should not be allowed", "another element"];
	expect(await register(params, ctx)).toEqual(new Error("400 ::: Email invalid"));
});

test("malformed email provided", async () => {
	const params = getParams();
	params.email = "foo_bar_baz";
	expect(await register(params, ctx)).toEqual(new Error("400 ::: Email not valid"));
	expect(ctx.body).toBeNull();
});

test("no institution provided", async () => {
	const params = getParams();
	delete params.school;
	expect(await register(params, ctx)).toEqual(new Error("400 ::: Institution invalid"));
});

test("invalid institution as string provided", async () => {
	const params = getParams();
	params.school = ["an array should not be allowed", "another element"];
	expect(await register(params, ctx)).toEqual(new Error("400 ::: Institution invalid"));
});

test("invalid institution as nagetive provided ", async () => {
	const params = getParams();
	params.school = -1;
	expect(await register(params, ctx)).toEqual(new Error("400 ::: Institution must be positive"));
	expect(ctx.body).toBeNull();
});

test("error Institution not found", async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("FROM school") !== -1) {
			return { rows: [] };
		}
		throw new Error("should never get here");
	};
	expect(await register(params, ctx)).toEqual(new Error("400 ::: Institution not found"));
});

test("error while execute select approved_domain value", async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("COUNT(*) AS _count_ FROM school") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("_count_ FROM approved_domain") !== -1) {
			throw new Error("Unexpected error [2]");
		}
	};
	expect(await register(params, ctx)).toEqual(new Error("400 ::: Institution not found"));
});

// test("error while execute insert", async () => {
// 	const params = getParams();
// 	ctx.doAppQuery = async function (query, values) {
// 		if (query.indexOf("COUNT(*) AS _count_ FROM school") !== -1) {
// 			return { rows: [{ count: 1 }] };
// 		}
// 		if (query.indexOf("_count_ FROM approved_domain") !== -1) {
// 			return { rows: [{ _count_: 1 }] };
// 		}
// 		if (query.indexOf("INSERT INTO cla_user") !== -1) {
// 			return { rows: [] };
// 		}
// 		throw new Error("should never get here");
// 	};
// 	expect(await register(params, ctx)).toEqual(new Error("500 ::: Could not register [1]"));
// });

// test("error A user with that email already exists", async () => {
// 	const params = getParams();
// 	ctx.doAppQuery = async function (query, values) {
// 		if (query.indexOf("COUNT(*) AS _count_ FROM school") !== -1) {
// 			return { rows: [{ count: 1 }] };
// 		}
// 		if (query.indexOf("_count_ FROM approved_domain") !== -1) {
// 			return { rows: [{ _count_: 1 }] };
// 		}
// 		if (query.indexOf("INSERT") !== -1) {
// 			throw new Error("A user violates unique constraint occur");
// 		}
// 		throw new Error("should never get here");
// 	};
// 	expect(await register(params, ctx)).toEqual(new Error("400 ::: A user with that email already exists"));
// });

// test("error send verify email", async () => {
// 	const params = getParams();
// 	let email = params.email;
// 	emailSend = async (sendEmail, email, token) => {
// 		throw new Error("Unknown error");
// 	};
// 	ctx.doAppQuery = async function (query, values) {
// 		if (query.indexOf("COUNT(*) AS _count_ FROM school") !== -1) {
// 			return { rows: [{ count: 1 }] };
// 		}
// 		if (query.indexOf("_count_ FROM approved_domain") !== -1) {
// 			return { rows: [{ _count_: 1 }] };
// 		}
// 		if (query.indexOf("INSERT") !== -1) {
// 			return { rows: [] };
// 		}
// 		throw new Error("should never get here");
// 	};
// 	expect(await register(params, ctx, emailSend)).toEqual(new Error("500 ::: Could not register [1]"));
// 	expect(ctx.body).toBeNull();
// });

test("successfully register approved domain user", async () => {
	emailSend = async (sendEmail, email, token) => {
		return true;
	};
	const params = getParams();
	params.job_title = "Mr";
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("FROM school") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (query.indexOf("FROM approved_domain") !== -1) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("INSERT INTO cla_user") !== -1) {
			return { rows: [{ id: 1 }] };
		}
		throw new Error("should never get here");
	};
	expect(await register(params)).toBeNull();
	expect(ctx.body).toEqual({
		result: true,
		auto_registered: true,
	});
});

test("successfully register non approved domain user", async () => {
	emailSend = async (sendEmail, email, token) => {
		return true;
	};
	const params = getParams();
	params.registered_with_approved_domain = false;
	ctx.doAppQuery = async function (query, values) {
		if (query.indexOf("FROM school") !== -1) {
			return { rows: [{ count: 1 }] };
		}
		if (query.indexOf("FROM approved_domain") !== -1) {
			return { rows: [{ _count_: 0 }] };
		}
		if (query.indexOf("INSERT INTO cla_user") !== -1) {
			return { rows: [{ id: 1 }] };
		}
		if (query.indexOf("trusted_domain") !== -1) {
			return { rows: [{ id: 5, domain: "foo.com" }], rowCount: 1 };
		}
		throw new Error("should never get here");
	};
	expect(await register(params)).toBeNull();
	expect(ctx.body).toEqual({
		result: true,
		auto_registered: {
			domain: "foo.com",
			id: 5,
		},
	});
});
