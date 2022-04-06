const extractPageJoinGetAllRaw = require("../../core/public/extract-page-join-get-all");
const Context = require("../common/Context");

let ctx;
// let mockExtractOId = "";

async function extractPageJoinGetAll(data) {
	let err = null;
	try {
		ctx.body = await extractPageJoinGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function resetAll() {
	mockExtractOId = { extract_oid: "fac1813fea6267d09149406da6abea1de1ad", page: 1 };
	ctx = new Context();
	ctx.responseStatus = 200;
	ctx.body = null;
}

beforeEach(resetAll);
afterEach(resetAll);

function getParams() {
	return mockExtractOId;
}

test(`Successfully get page join for specific extract `, async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		return {
			rows: [
				{
					extract_id: 234,
					page: 1,
					first_highlight_name: "Mr Gagan",
					first_highlight_date: "2020-11-05T18:02:13.506Z",
				},
			],
		};
	};
	expect(await extractPageJoinGetAll(params)).toBe(null);
});

test(`when page is not provided`, async () => {
	const params = getParams();
	delete params.page;
	ctx.doAppQuery = async function (query, values) {
		return {
			rows: [
				{
					extract_id: 234,
					page: 0,
					first_highlight_name: "Mr. Gagan",
					first_highlight_date: "2020-11-05T18:02:13.506Z",
				},
				{
					extract_id: 234,
					page: 1,
					first_highlight_name: "Mr. Parmar",
					first_highlight_date: "2020-11-05T18:02:13.506Z",
				},
			],
		};
	};
	expect(await extractPageJoinGetAll(params)).toBe(null);
});
