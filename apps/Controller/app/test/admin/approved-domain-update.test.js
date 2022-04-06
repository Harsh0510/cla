const approvedDomainUpdateRaw = require("../../core/admin/approved-domain-update");
const Context = require("../common/Context");

let ctx;
let mockIsIncludeModifyUserId;
let mockIsIncludeDateEdited;

function getValidRequest() {
	return {
		id: 1,
		school_id: 1,
		domain: "email.com",
	};
}

function resetAll() {
	ctx = new Context();
	mockIsIncludeModifyUserId = false;
	mockIsIncludeDateEdited = false;
}

beforeEach(resetAll);
afterEach(resetAll);

async function approvedDomainUpdate(data) {
	let err = null;
	try {
		ctx.body = await approvedDomainUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is teacher`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	expect(await approvedDomainUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when user is school-admin`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	expect(await approvedDomainUpdate(data)).toEqual(new Error("401 ::: Unauthorized"));
});

test(`Error when a Id is invalid`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	delete data.id;
	expect(await approvedDomainUpdate(data)).toEqual(new Error("400 ::: ID invalid"));
});

test(`Error when a Id is negative`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.id = -1;
	expect(await approvedDomainUpdate(data)).toEqual(new Error("400 ::: ID must not be negative"));
});

test(`Error when institution is negative number`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.school_id = -1;
	expect(await approvedDomainUpdate(data)).toEqual(new Error("400 ::: Institution must not be negative"));
});

test(`Error when a domain is not provided`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	data.domain = "";
	expect(await approvedDomainUpdate(data)).toEqual(new Error("400 ::: Domain not provided"));
});

test(`Error when a domain is not valid`, async () => {
	const data = getValidRequest();
	data.domain = ["abc@gmail.com"];
	data.school_id = 1;
	expect(await approvedDomainUpdate(data)).toEqual(new Error("400 ::: Domain invalid"));
});

test(`Error when query throws an error`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		throw new Error();
	};
	expect(await approvedDomainUpdate(data)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test(`Error when no pass any parameter`, async () => {
	const data = getValidRequest();
	delete data.school_id;
	delete data.domain;
	ctx.sessionData.user_role = "cla-admin";
	expect(await approvedDomainUpdate(data)).toEqual(new Error("400 ::: No fields changed"));
});

test(`Error when query throws unique key violation`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		throw "Unknown Error";
	};
	expect(await approvedDomainUpdate(data)).toEqual(new Error("400 ::: Unknown Error"));
});

test(`Error when query throws unique key violation`, async () => {
	const data = getValidRequest();
	data.school_id = 1;
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		throw new Error("unique key violation");
	};
	expect(await approvedDomainUpdate(data)).toEqual(new Error("400 ::: That domain already exists for the provided institution"));
});

test(`Return data when request is well formed`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await approvedDomainUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Ensure modified_by_user_id and date_edited updated successfully in database`, async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "cla-admin";
	ctx.doAppQuery = (query, values) => {
		mockIsIncludeModifyUserId = query.indexOf("modified_by_user_id") !== -1 ? true : false;
		mockIsIncludeDateEdited = query.indexOf("date_edited") !== -1 ? true : false;
		return { rows: [{ id: 1 }], rowCount: 1 };
	};
	expect(await approvedDomainUpdate(data)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
	expect(mockIsIncludeModifyUserId).toEqual(true);
	expect(mockIsIncludeDateEdited).toEqual(true);
});
