const classDeleteRaw = require("../../core/admin/class-delete");

const Context = require("../common/Context");

let ctx;

function resetAll() {
	ctx = new Context();
}

beforeEach(resetAll);
afterEach(resetAll);

const GOOD_OID = "b57bd0d3b940d1690526621e0e8d40511c09";

function getValidRequest() {
	return {
		oid: GOOD_OID,
	};
}

async function classDelete(data) {
	let err = null;
	try {
		ctx.body = await classDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("not logged in", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = null;
	expect(await classDelete(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toBeNull();
});

test("no class oid provided", async () => {
	const data = getValidRequest();
	delete data.oid;
	expect(await classDelete(data)).toEqual(new Error("400 ::: OID not provided"));
	expect(ctx.body).toBeNull();
});

test("error running sql query to fetch user", async () => {
	const data = getValidRequest();
	ctx.appDbQuery = (query, values) => {
		if (query.includes("oid")) {
			throw new Error();
		}
		return { rows: [{ _count_: 1 }], rowCount: 1 };
	};
	expect(await classDelete(data)).toEqual(new Error("400 ::: Unknown Error [1]"));
});

test("class with specified oid not found", async () => {
	const data = getValidRequest();
	ctx.appDbQuery = (query, values) => {
		if (query.includes("oid")) {
			return { rows: [{ _count_: 0 }], rowCount: 0 };
		}
		return { rows: [], rowCount: 0 };
	};
	expect(await classDelete(data)).toBeNull();
	expect(ctx.body).toEqual({ result: false });
});

test("successful deletion as cla admin", async () => {
	const data = getValidRequest();
	ctx.doAppQuery = (query, values) => {
		return { rows: [], rowCount: 1 };
	};
	expect(await classDelete(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("successful deletion as school admin", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 1;
	ctx.sessionData.user_id = 5;
	ctx.doAppQuery = (query, values) => {
		return { rows: [], rowCount: 1 };
	};
	expect(await classDelete(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test("successful deletion as teacher", async () => {
	const data = getValidRequest();
	ctx.sessionData.user_role = "teacher";
	ctx.sessionData.school_id = 1;
	ctx.sessionData.user_id = 5;
	ctx.doAppQuery = (query, values) => {
		return { rows: [], rowCount: 1 };
	};
	expect(await classDelete(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({ result: true });
});

test(`Error when query throws an error if class have active copies`, async () => {
	const data = getValidRequest();
	ctx.appDbQuery = (query, values) => {
		if (query.includes("oid")) {
			return { rows: [{ _count_: 1 }], rowCount: 1 };
		}
		return { rows: [], rowCount: 0 };
	};
	expect(await classDelete(data)).toEqual(new Error("400 ::: You may not delete a class that has active copies"));
});
