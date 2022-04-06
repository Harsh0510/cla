const extractNoteGetAllRaw = require("../../core/public/extract-note-get-all");
const Context = require("../common/Context");

let ctx;
// let mockExtractOId = "";

async function extractNoteGetAll(data) {
	let err = null;
	try {
		ctx.body = await extractNoteGetAllRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function resetAll() {
	mockExtractOId = { extract_oid: "4fc1a745f851422ed831295e7ac7a099e005" };
	ctx = new Context();
	ctx.responseStatus = 200;
	ctx.body = null;
}

beforeEach(resetAll);
afterEach(resetAll);

function getParams() {
	return mockExtractOId;
}

// test(`Error when not logged in`, async () => {
// 	const params = getParams();
// 	ctx.ensureLoggedIn = (_) => new Promise((resolve, reject) => reject(new Error("failed")));
// 	expect(await extractNoteGetAll(params, ctx)).toEqual(new Error("failed"));
// });

test(`Error when sql throw exception 'Extract oid not provided'`, async () => {
	mockExtractOId = "";
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		throw "Extract oid not provided";
	};
	expect(await extractNoteGetAll(params, ctx)).toEqual("Extract oid not provided");
});

test(`Return without any row found`, async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		return { rows: [] };
	};
	expect(await extractNoteGetAll(params, ctx)).toEqual(null);
});

test(`Success! `, async () => {
	const params = getParams();
	ctx.doAppQuery = async function (query, values) {
		return {
			rows: [{ extract_id: 305 }, { extract_id: 306 }],
		};
	};
	expect(await extractNoteGetAll(params)).toBe(null);
});

test(`Error when invalid page is provided`, async () => {
	const params = getParams();
	params.page = 0;
	ctx.doAppQuery = async function (query, values) {
		throw "page is invalid";
	};
	expect(await extractNoteGetAll(params)).toEqual("page is invalid");
});
