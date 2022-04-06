const extractHighlightGetAllRaw = require("../../core/public/extract-highlight-get-all");
const Context = require("../common/Context");

let ctx;
// let mockExtractOId = "";

async function extractHightlightGetAll(data) {
	let err = null;
	try {
		ctx.body = await extractHighlightGetAllRaw(data, ctx);
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

test(`Error when sql throw exception 'Extract oid not provided'`, async () => {
	mockExtractOId = "";
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		throw "Extract oid not provided";
	};
	expect(await extractHightlightGetAll(params, ctx)).toEqual(new Error("400 ::: Extract oid not provided"));
});

test(`Return without any row found`, async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		return { rows: [] };
	};
	expect(await extractHightlightGetAll(params, ctx)).toEqual(null);
});

test(`Successfully get all highlight for specific extract `, async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		return {
			rows: [
				{
					oid: "7336749e94c5d8d2c7b66ae565f4f17b7aee",
					colour: "#FFFF00",
					position_x: 1.5,
					position_y: 5.5,
					width: 200,
					height: 100,
					page: 1,
					date_created: "2020-11-05T18:02:13.506Z",
				},
			],
		};
	};
	expect(await extractHightlightGetAll(params)).toBe(null);
});

test(`Get all highlight for all page index`, async () => {
	const params = getParams();
	delete params.page;
	ctx.doAppQuery = async function (query, values) {
		return {
			rows: [
				{
					oid: "7336749e94c5d8d2c7b66ae565f4f17b7aee",
					colour: "#FFFF00",
					position_x: 1.5,
					position_y: 5.5,
					width: 200,
					height: 100,
					page: 1,
					date_created: "2020-11-05T18:02:13.506Z",
				},
				{
					oid: "7336749e94c5d8d2c7b66ae565f4f17b7aee",
					colour: "#FFFF00",
					position_x: 1.5,
					position_y: 5.5,
					width: 200,
					height: 100,
					page: 2,
					date_created: "2020-11-05T18:02:13.506Z",
				},
			],
		};
	};
	expect(await extractHightlightGetAll(params, ctx)).toEqual(null);
});

test(`Error when invalid page is provided`, async () => {
	const params = getParams();
	params.page = 0;
	ctx.doAppQuery = async function (query, values) {
		throw "page is invalid";
	};
	expect(await extractHightlightGetAll(params)).toEqual("page is invalid");
});
