const getSchoolIdFromExtractRaw = require("../../../core/public/common/getSchoolIdFromExtract");
const context = require("../../common/Context");

let ctx, params;

function resetAll() {
	ctx = new context();
	params = {
		extractOid: "60b6ae2e2111611f03332044d6b14c73bd4a",
	};

	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT school_id") !== -1) {
			return {
				rows: [
					{
						school_id: 1,
					},
				],
				rowCount: 1,
			};
		}
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function getSchoolIdFromExtract(data) {
	let err = null;
	try {
		ctx.body = await getSchoolIdFromExtractRaw(ctx, params.extractOid);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return params;
}

test("When user is a cla-admin", async () => {
	let params = getParams();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT school_id") !== -1) {
			return {
				rows: [
					{
						school_id: 1,
					},
				],
				rowCount: 1,
			};
		}
	};
	expect(await getSchoolIdFromExtract(params)).toEqual(null);
	expect(ctx.body).toBe(1);
});

test("When user is not a cla-admin", async () => {
	let params = getParams();
	ctx.sessionData.user_role = "school-admin";
	ctx.sessionData.school_id = 1;
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT school_id") === -1) {
			throw new Error("Unknown");
		}
	};
	expect(await getSchoolIdFromExtract(params)).toBe(null);
	expect(ctx.body).toBe(1);
});

test("When user is a cla-admin but don't pass extract oid", async () => {
	let params = getParams();
	delete params["extractOid"];
	expect(await getSchoolIdFromExtract(params)).toEqual(new Error("400 ::: Extract OId not provided"));
});

test("Error when requester is not associated with a school", async () => {
	let params = getParams();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("SELECT school_id") !== -1) {
			return {
				rows: [],
				rowCount: 0,
			};
		}
	};
	expect(await getSchoolIdFromExtract(params)).toEqual(new Error("401 ::: You must be associated with an institution"));
	expect(ctx.body).toBe(null);
});
