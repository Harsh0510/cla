const { contentRequestType } = require("../../common/staticValues");
const contentRequestCreateRaw = require("../../core/admin/content-request-create");
const Context = require("../common/Context");

let ctx;
let mockUserSessionData;

function getValidRequest() {
	return {
		request_types: [contentRequestType.bookRequest],
		isbn: "",
		book_title: "",
		book_request_author: "",
		book_request_publisher: "",
		publication_year: "",
		url: "",
		authors: "",
		publishers: "",
		content_type: "",
		content_type_note: "",
		other_note: "",
	};
}

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

	ctx.appDbQuery = (query, values) => {
		query = query.replace(/\s+/g, " ");
		if (query.indexOf("SELECT name AS school_name FROM school") !== -1) {
			return {
				rowCount: 1,
				rows: [
					{
						school_name: "Test school",
					},
				],
			};
		}

		if (query.indexOf("INSERT INTO content_request") !== -1) {
			return {
				rowCount: 1,
				rows: [
					{
						id: 10,
					},
				],
			};
		}

		if (query.indexOf("SELECT id FROM content_type") !== -1) {
			return {
				rowCount: 1,
				rows: [
					{
						id: 1,
					},
				],
			};
		}
	};
}

beforeEach(resetAll);
afterEach(resetAll);

async function contentRequestCreate(data) {
	let err = null;
	try {
		ctx.body = await contentRequestCreateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test("Error when not logged in", async () => {
	mockUserSessionData = {};
	const params = getValidRequest();
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test("Error when user not logged as institution admin or teacher", async () => {
	mockUserSessionData.user_role = "other";
	const params = getValidRequest();
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.body).toEqual(null);
});

test("Error when user not associated with any institution", async () => {
	mockUserSessionData.school_id = null;
	const params = getValidRequest();
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("401 ::: You must be associated with a school to create an asset request"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is an empty array", async () => {
	const params = getValidRequest();
	params.request_types = [];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Request type is required"));
	expect(ctx.body).toEqual(null);
});

test("Error when invalid request type is provided", async () => {
	const params = getValidRequest();
	params.request_types = ["Book"];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Request type Book is invalid"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is book and data not provided", async () => {
	const params = getValidRequest();
	params.isbn = "";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: One of the field is required"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is book and invalid isbn is provided(number)", async () => {
	const params = getValidRequest();
	params.isbn = 9876543210;
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Invalid isbn provided"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is book and invalid isbn is provided", async () => {
	const params = getValidRequest();
	params.isbn = "98765432";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: ISBN is not valid"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is book and valid isbn is provided", async () => {
	const params = getValidRequest();
	params.isbn = "9781138313637";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Success when request type is book and valid book title is provided", async () => {
	const params = getValidRequest();
	params.book_title = "test title";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error when request type is book and invalid authors is provided", async () => {
	const params = getValidRequest();
	params.book_request_author = ["author"];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Invalid book_request_author provided"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is book and valid authors provided", async () => {
	const params = getValidRequest();
	params.book_request_author = "author";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Success when request type is book and valid publishers provided", async () => {
	const params = getValidRequest();
	params.book_request_publisher = "publisher";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error when request type is book and invalid publishers is provided", async () => {
	const params = getValidRequest();
	params.book_request_publisher = ["publisher"];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Invalid book_request_publisher provided"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is book and invalid publication year provided", async () => {
	const params = getValidRequest();
	params.publication_year = 2021;
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Invalid publication year provided"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is book and valid publication year provided", async () => {
	const params = getValidRequest();
	params.publication_year = "1000";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error when request type is book and invalid url provided", async () => {
	const params = getValidRequest();
	params.url = 1234;
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Invalid url provided"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is book and valid url provided", async () => {
	const params = getValidRequest();
	params.url = "google.com";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error when request type is author and authors not provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.authorRequest];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Authors is required"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is author and invalid authors provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.authorRequest];
	params.authors = "author";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Authors must be an array"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is author and valid authors provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.authorRequest];
	params.authors = ["author"];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error when request type is publisher and publishers not provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.publisherRequest];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Publishers is required"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is publisher and invalid publishers provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.publisherRequest];
	params.publishers = "publisher";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Publishers must be an array"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is publisher and valid publishers provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.publisherRequest];
	params.publishers = ["publisher"];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error when request type is content and no data provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.contentTypeRequest];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: One of the field is required"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is content and invalid content type provided(string)", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.contentTypeRequest];
	params.content_type = "type";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Content type must be an array"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is content and invalid content type provided(string array)", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.contentTypeRequest];
	params.content_type = ["type"];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Invalid content type provided"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is content and valid content type provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.contentTypeRequest];
	params.content_type = [1, 2];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error when request type is content and invalid content type note provided(number)", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.contentTypeRequest];
	params.content_type_note = 123;
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Invalid content_type_note provided"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is content and valid content type note provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.contentTypeRequest];
	params.content_type_note = "content type note";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error when request type is other and invalid other note provided(number)", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.otherRequest];
	params.other_note = 123;
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Invalid other_note provided"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is other and valid other note note provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.otherRequest];
	params.other_note = "other note";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});

test("Error when request type is more than one and invalid isbn data provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.bookRequest, contentRequestType.authorRequest];
	params.isbn = "1234";
	params.authors = ["author"];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: ISBN is not valid"));
	expect(ctx.body).toEqual(null);
});

test("Error when request type is more than one and invalid author data provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.bookRequest, contentRequestType.authorRequest];
	params.isbn = "9781138313637";
	params.authors = "author";
	const item = await contentRequestCreate(params);
	expect(item).toEqual(new Error("400 ::: Authors must be an array"));
	expect(ctx.body).toEqual(null);
});

test("Success when request type is more than one and valid data provided", async () => {
	const params = getValidRequest();
	params.request_types = [contentRequestType.bookRequest, contentRequestType.authorRequest];
	params.isbn = "9781138313637";
	params.authors = ["author"];
	const item = await contentRequestCreate(params);
	expect(item).toEqual(null);
	expect(ctx.body).toEqual({ created: true });
});
