const extractNoteCreateRaw = require("../../core/public/extract-note-create");

let ctx;
let mockFromExtractResult = [],
	mockInsertIntoResult = [];

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
}

async function getDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("FROM extract ") !== -1) {
		return {
			rows: mockFromExtractResult,
		};
	}
	if (query.indexOf("INSERT INTO extract_note ") !== -1) {
		return {
			rows: mockInsertIntoResult,
		};
	}
	throw new Error("should not be here");
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockFromExtractResult = [{ extract_id: 305, user_id: 185692 }];
	mockInsertIntoResult = [
		{
			oid: "7a5289732c864505ef154fcbcbf92c99055b",
			colour: "#2345",
			position_x: 0.5,
			position_y: 9.1,
			width: 34,
			height: 45,
			content: "sd",
			page: 123,
			zindex: 34,
		},
	];
	ctx = {
		assert(expr, status, msg) {
			if (expr) {
				return;
			}
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		throw(status, msg) {
			ctx.responseStatus = status;
			throw new Error(`${status} ::: ${msg}`);
		},
		async ensureLoggedIn() {
			return true;
		},
		async getSessionData() {
			return getGoodSessionData();
		},
		async appDbQuery(a, b) {
			return await getDbQuery(a, b);
		},
		responseStatus: 200,
	};
}

/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function extractNoteCreate(data) {
	let err = null;
	try {
		ctx.body = await extractNoteCreateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		oid: "7a5289732c864505ef154fcbcbf92c99055b",
		extract_oid: "7a5289732c864505ef154fcbcbf92c99055b",
		colour: "#2345",
		position_x: 0.5,
		position_y: 9.1,
		width: 34,
		height: 45,
		content: "sd",
		page: 123,
		zindex: 34,
	};
}

test(`Error when requester is not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractNoteCreate(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Error when invalid Extract oid is provided`, async () => {
	const params = getGoodParams();
	params.extract_oid = 5;
	expect(await extractNoteCreate(params)).toEqual(new Error("400 ::: Extract oid invalid"));
});

test(`Error when width should not be the real type`, async () => {
	const params = getGoodParams();
	params.width = "ab";
	expect(await extractNoteCreate(params)).toEqual(new Error("400 ::: Width should be the real type"));
});

test(`Error when height should not be the real type`, async () => {
	const params = getGoodParams();
	params.height = "ac";
	expect(await extractNoteCreate(params)).toEqual(new Error("400 ::: Height should be the real type"));
});

test(`Error when position x should not be the real type`, async () => {
	const params = getGoodParams();
	params.position_x = "ab";
	expect(await extractNoteCreate(params)).toEqual(new Error("400 ::: Position x should be the real type"));
});

test(`Error when position y should not be the real type`, async () => {
	const params = getGoodParams();
	params.position_y = "xr";
	expect(await extractNoteCreate(params)).toEqual(new Error("400 ::: Position y should be the real type"));
});

test(`Error when invalid zindex is provided`, async () => {
	const params = getGoodParams();
	params.zindex = "67";
	expect(await extractNoteCreate(params)).toEqual(new Error("400 ::: zindex invalid"));
	params.page = -1;
	expect(await extractNoteCreate(params)).toEqual(new Error("400 ::: page must not be negative"));
});

test(`Success!`, async () => {
	const params = getGoodParams();
	expect(await extractNoteCreate(params)).toBe(null);
	expect(ctx.body).not.toEqual(null);
});

test(`When data is not inserted`, async () => {
	const params = getGoodParams();
	mockInsertIntoResult = [];
	expect(await extractNoteCreate(params)).toBe(null);
});

test(`When non extract creater trying to create note`, async () => {
	const params = getGoodParams();
	mockFromExtractResult = [{ extract_id: 305, user_id: 185693 }];
	expect(await extractNoteCreate(params)).toEqual(new Error("400 ::: You don't have rights to create the note for this extract."));
});

test(`Error when extract is not found`, async () => {
	const params = getGoodParams();
	mockFromExtractResult = [];
	expect(await extractNoteCreate(params)).toEqual(new Error("400 ::: Extract not found"));
});
