const contentRequestGetAllRaw = require("../../core/admin/content-request-get-all");
const Context = require("../common/Context");

let ctx;
let mockUserSessionData;
let mockQueryResult;

function resetAll() {
	ctx = new Context();

	mockUserSessionData = {
		user_id: 4,
		user_role: "cla-admin",
		school_id: 10,
		allowed_extract_ratio: 0.05,
		academic_year_end: [8, 15],
		user_email: "userloginemail@email.com",
	};

	ctx.getSessionData = () => {
		return mockUserSessionData;
	};

	mockQueryResult = {
		rowCount: 1,
		rows: [
			{
				id: 15,
				date_created: "2021-10-12T10:57:48.859Z",
				date_edited: "2021-10-12T10:57:48.859Z",
				user_id: 14759,
				school_id: 365518,
				school_name_log: "Aum vidhya Mandir",
				request_type: ["Content type request"],
				isbn: null,
				book_title: null,
				authors: null,
				publishers: null,
				publication_year: null,
				content_type_note: null,
				other_note: null,
				content_types: ["Biographies and Autobiographies", "Beauty and Complementary Therapies"],
			},
		],
	};

	ctx.appDbQuery = (query, values) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf("FROM content_request LEFT JOIN content_request_content_type_join") !== -1) {
			return mockQueryResult;
		}
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function contentRequestGetAll(data) {
	let err = null;
	try {
		ctx.body = await contentRequestGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("Error when not logged in", async () => {
	mockUserSessionData = {};
	const item = await contentRequestGetAll();
	expect(item).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test("Error when user not logged in as cla admin", async () => {
	mockUserSessionData.user_role = "teacher";
	const item = await contentRequestGetAll();
	expect(item).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test("Success", async () => {
	const item = await contentRequestGetAll();
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ result: mockQueryResult.rows });
});
