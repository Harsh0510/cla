const trustedDomainDeleteRaw = require("../../core/admin/trusted-domain-delete");
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

async function trustedDomainDelete(data) {
	let err = null;
	try {
		ctx.body = await trustedDomainDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await trustedDomainDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user is school-admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	expect(await trustedDomainDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when a ID is invalid`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	delete data.id;
	expect(await trustedDomainDelete(data)).toEqual(new Error("400 ::: ID invalid"));
});

test(`Error when a ID is negative`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.id = -1;
	expect(await trustedDomainDelete(data)).toEqual(new Error("400 ::: ID must not be negative"));
});

test(`Return data when request is well formed (deleted)`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("DELETE") === 0) {
			return { rows: [{ _count_: 1 }], rowCount: 1 };
		}
	};
	expect(await trustedDomainDelete(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Return data when request is well formed (did not delete)`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("DELETE") === 0) {
			return { rows: [], rowCount: 0 };
		}
	};
	expect(await trustedDomainDelete(data)).toBeNull();
	expect(ctx.body).toEqual({ result: false });
});
