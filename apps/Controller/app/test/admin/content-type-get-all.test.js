const contentTypeGetAllRaw = require("../../core/admin/content-type-get-all");
const Context = require("../common/Context");

let ctx;
let mockUserSessionData;
let mockQueryResult;

function resetAll() {
	ctx = new Context();

	mockUserSessionData = {
		user_id: 4,
		user_role: "school-admin",
		school_id: 10,
		allowed_extract_ratio: 0.05,
		academic_year_end: [8, 15],
		user_email: "userloginemail@email.com",
	};

	ctx.getSessionData = () => {
		return mockUserSessionData;
	};

	mockQueryResult = {
		rowCount: 2,
		rows: [
			{
				id: 1,
				title: "Content type1",
			},
			{
				id: 2,
				title: "Content type2",
			},
		],
	};

	ctx.appDbQuery = (query, values) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf("SELECT id AS id, title AS title FROM content_type") !== -1) {
			return mockQueryResult;
		}
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function contentTypeGetAll(data) {
	let err = null;
	try {
		ctx.body = await contentTypeGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("Error when not logged in", async () => {
	mockUserSessionData = {};
	const item = await contentTypeGetAll();
	expect(item).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test("Error when user logged in as a cla admin", async () => {
	mockUserSessionData.user_role = "cla-admin";
	const item = await contentTypeGetAll();
	expect(item).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test("Success", async () => {
	const item = await contentTypeGetAll();
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ data: mockQueryResult.rows });
});
