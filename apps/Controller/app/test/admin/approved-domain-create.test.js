const approvedDomainCreateRaw = require("../../core/admin/approved-domain-create");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		school_id: 1,
		domain: "email.com",
	};
}

function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

async function approvedDomainCreate(data) {
	let err = null;
	try {
		ctx.body = await approvedDomainCreateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await approvedDomainCreate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user is school-admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	expect(await approvedDomainCreate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when an institution is negative number`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.school_id = -1;
	expect(await approvedDomainCreate(data)).toEqual(new Error("400 ::: Institution must not be negative"));
});

test(`Error when a domain is not provided`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.domain = "";
	expect(await approvedDomainCreate(data)).toEqual(new Error("400 ::: Domain not provided"));
});

test(`Error when a domain is not valid`, async () => {
	const data = getValidRequest();
	data.domain = ["abc@gmail.com"];
	data.school_id = 1;
	expect(await approvedDomainCreate(data)).toEqual(new Error("400 ::: Domain invalid"));
});

test(`Error when an institution is not found in institution table of database`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ _count_: 0 }] };
	};
	expect(await approvedDomainCreate(data)).toEqual(new Error("400 ::: Institution does not exist"));
});

test(`Error when query throws an error`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("SELECT") === 0) {
			return { rows: [{ _count_: 1 }] };
		}
		throw new Error();
	};
	expect(await approvedDomainCreate(data)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test(`Error when query throws unique key violation`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("SELECT") === 0) {
			return { rows: [{ _count_: 1 }] };
		}
		if (query.indexOf("INSERT INTO") === 0) {
			throw new Error("unique key violation");
		}
	};
	expect(await approvedDomainCreate(data)).toEqual(new Error("400 ::: That domain already exists for the provided institution"));
});

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("SELECT") === 0) {
			return { rows: [{ _count_: 1 }], rowCount: 1 };
		}
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await approvedDomainCreate(data)).toBeNull();
	expect(ctx.body).toMatchObject({ id: 1, success: true });
});
