const trustedDomainUpdateRaw = require("../../core/admin/trusted-domain-update");
const Context = require("../common/Context");

let ctx;

function getValidRequest() {
	return {
		id: 1,
		domain: "email.com",
	};
}

function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

async function trustedDomainUpdate(data) {
	let err = null;
	try {
		ctx.body = await trustedDomainUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await trustedDomainUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user is school-admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	expect(await trustedDomainUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when a ID is invalid`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	delete data.id;
	expect(await trustedDomainUpdate(data)).toEqual(new Error("400 ::: ID invalid"));
});

test(`Error when a ID is negative`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.id = -1;
	expect(await trustedDomainUpdate(data)).toEqual(new Error("400 ::: ID must not be negative"));
});

test(`Error when a domain is not provided`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.domain = "";
	expect(await trustedDomainUpdate(data)).toEqual(new Error("400 ::: Domain not provided"));
});

test(`Error when a domain is not valid`, async () => {
	const data = getValidRequest();
	data.domain = ["abc@gmail.com"];
	expect(await trustedDomainUpdate(data)).toEqual(new Error("400 ::: Domain invalid"));
});

test(`Error when query throws an error`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("trusted_domain") >= 0) {
			throw new Error();
		}
		return { rows: [], rowCount: 0 };
	};
	expect(await trustedDomainUpdate(data)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test(`Error when no pass any parameter`, async () => {
	ctx.sessionData.user_role = "cla-admin";
	expect(await trustedDomainUpdate({ id: 2 })).toEqual(new Error("400 ::: No fields changed"));
});

test(`Error when a generic SQL error happens`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("trusted_domain") >= 0) {
			throw new Error("Some Random Error");
		}
		return { rows: [], rowCount: 0 };
	};
	expect(await trustedDomainUpdate(data)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test(`Error when query throws unique key violation`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		if (query.indexOf("trusted_domain") >= 0) {
			throw new Error("unique key violation");
		}
		return { rows: [], rowCount: 0 };
	};
	expect(await trustedDomainUpdate(data)).toEqual(new Error("400 ::: That domain already exists"));
});

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await trustedDomainUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});
