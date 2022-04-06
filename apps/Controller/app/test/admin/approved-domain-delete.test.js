const approvedDomainDeleteRaw = require("../../core/admin/approved-domain-delete");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		id: 1,
	};
}

function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

async function approvedDomainDelete(data) {
	let err = null;
	try {
		ctx.body = await approvedDomainDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await approvedDomainDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user is school-admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	expect(await approvedDomainDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when a Id is invalid`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	delete data.id;
	expect(await approvedDomainDelete(data)).toEqual(new Error("400 ::: ID invalid"));
});

test(`Error when a Id is negative`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.id = -1;
	expect(await approvedDomainDelete(data)).toEqual(new Error("400 ::: ID must not be negative"));
});

test(`Error when query throws an error`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		throw new Error();
	};
	expect(await approvedDomainDelete(data)).toEqual(new Error("400 ::: Could not delete approved domain"));
});

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("DELETE") === 0) {
			return { rows: [{ _count_: 1 }], rowCount: 1 };
		}
	};
	expect(await approvedDomainDelete(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});
