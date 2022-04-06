const extractAccessGetAllRaw = require("../../core/admin/extract-access-get-all");
const Context = require("../common/Context");

let ctx, data;

function resetAll() {
	ctx = new Context();
	data = null;
}

beforeEach(resetAll);
afterEach(resetAll);

async function extractAccessGetAll(data) {
	let err = null;
	try {
		ctx.body = await extractAccessGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Error when user is not a cla admin`, async () => {
	ctx.sessionData.user_role = "teacher";
	expect(await extractAccessGetAll(data)).toEqual(new Error("401 ::: Unauthorized"));
	expect(ctx.responseStatus).toEqual(401);
});

test(`Success when user is not a cla admin`, async () => {
	ctx.doAppQuery = (query) => {
		return {
			rows: [
				{
					id: 1,
					asset_id: "152",
					date_created: "2019-03-06T13:54:20.107Z",
					title_of_work: "Copty 1",
					title_of_copy: "Test copy 1",
					extract_id: "123",
					extract_oid: "1234",
					extract_share_oid: "1234",
					ip_address: "192.168.1.1",
					user_agent: "foo",
					referrer: "foo",
				},
				{
					id: 2,
					asset_id: "251",
					date_created: "2019-03-07T13:54:20.107Z",
					title_of_work: "Copty 2",
					title_of_copy: "Test copy 2",
					extract_id: "234",
					extract_oid: "1235",
					extract_share_oid: "1235",
					ip_address: "192.168.1.2",
					user_agent: "foo1",
					referrer: "foo1",
				},
			],
			rowCount: 2,
		};
	};
	ctx.sessionData.user_role = "cla-admin";
	expect(await extractAccessGetAll(data)).toBeNull();
	expect(ctx.responseStatus).toEqual(200);
	expect(ctx.body).toEqual({
		result: [
			{
				id: 1,
				asset_id: "152",
				date_created: "2019-03-06T13:54:20.107Z",
				title_of_work: "Copty 1",
				title_of_copy: "Test copy 1",
				extract_id: "123",
				extract_oid: "1234",
				extract_share_oid: "1234",
				ip_address: "192.168.1.1",
				user_agent: "foo",
				referrer: "foo",
			},
			{
				id: 2,
				asset_id: "251",
				date_created: "2019-03-07T13:54:20.107Z",
				title_of_work: "Copty 2",
				title_of_copy: "Test copy 2",
				extract_id: "234",
				extract_oid: "1235",
				extract_share_oid: "1235",
				ip_address: "192.168.1.2",
				user_agent: "foo1",
				referrer: "foo1",
			},
		],
	});
});

test(`Success when user is not a cla admin`, async () => {
	ctx.doAppQuery = (query) => {
		throw new Error("Unknown error");
	};
	ctx.sessionData.user_role = "cla-admin";
	expect(await extractAccessGetAll(data)).toEqual(new Error("400 ::: Unknown error"));
	expect(ctx.body).toBeNull();
	expect(ctx.responseStatus).toEqual(400);
});
