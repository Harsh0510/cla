const getTeacherNameRaw = require("../../../core/public/common/getTeacherName");
const context = require("../../common/Context");

let ctx;
let params;

function resetAll() {
	ctx = new context();
	params = {
		userId: "12",
	};

	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("FROM cla_user") !== -1) {
			return {
				rows: [
					{
						teacher_name: "test teacher",
					},
				],
				rowCount: 1,
			};
		}
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function getTeacherName(data) {
	let err = null;
	try {
		ctx.body = await getTeacherNameRaw(ctx, params.userId);
	} catch (e) {
		err = e;
	}
	return err;
}

function getParams() {
	return params;
}

test("When user fetch successfully", async () => {
	const params = getParams();
	expect(await getTeacherName(params)).toEqual(null);
	expect(ctx.body).toBe("test teacher");
});

test("Error when user not fetch", async () => {
	const params = getParams();
	ctx.appDbQuery = (query, values) => {
		let trimQuery = query.trim().replace(/\s+/g, " ");
		if (trimQuery.indexOf("FROM cla_user") !== -1) {
			return {
				rows: [],
				rowCount: 0,
			};
		}
	};
	expect(await getTeacherName(params)).toEqual(new Error("400 ::: Could not fetch user"));
	expect(ctx.body).toBe(null);
});
