const extractNoteUpdateRaw = require("../../core/public/extract-note-update");
const context = require("../common/Context");

let ctx;
let mockUpdateExtractNoteResult = [];
let mockFromExtractNoteResult = [];

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
}

async function getDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("SELECT extract_note.extract_id AS extract_id") !== -1) {
		return {
			rows: mockFromExtractNoteResult,
		};
	} else if (query.indexOf("UPDATE extract_note SET zindex") !== -1) {
		return {
			rows: mockUpdateExtractNoteResult,
		};
	} else if (query.indexOf("UPDATE extract_note ") !== -1) {
		return {
			rows: mockUpdateExtractNoteResult,
		};
	}
	throw new Error("should not be here");
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	ctx = new context();
	mockUpdateExtractNoteResult = [
		{
			oid: "7a5289732c864505ef154fcbcbf92c99055b",
			position_x: 0.5,
			position_y: 9.1,
			width: 34,
			height: 45,
			content: "sd",
			page: 123,
			zindex: 34,
		},
	];
	mockFromExtractNoteResult = [{ extract_id: 305, user_id: 185692 }];
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

async function extractNoteUpdate(data) {
	let err = null;
	try {
		ctx.body = await extractNoteUpdateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		oid: "7a5289732c864505ef154fcbcbf92c99055b",
		position_x: 0.5,
		position_y: 9.1,
		width: 34,
		height: 45,
		content: "sd",
		page: 123,
		zindex: 34,
	};
}

test(`Error when not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractNoteUpdate(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Error when note content should not be string`, async () => {
	let params = getGoodParams();
	params.content = 34;
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: Content should be string type"));
});

test(`Error when Width should not be the real type`, async () => {
	let params = getGoodParams();
	params.width = "ab";
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: Width should be the real type"));
});

test(`Error when Height should not be the real type`, async () => {
	let params = getGoodParams();
	params.height = "ac";
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: Height should be the real type"));
});

test(`Error when Position x should not be the real type`, async () => {
	let params = getGoodParams();
	params.position_x = "ab";
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: Position x should be the real type"));
});

test(`Error when Position y should not be the real type`, async () => {
	let params = getGoodParams();
	params.position_y = "ac";
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: Position y should be the real type"));
});

test(`Error when extract is not found`, async () => {
	const params = getGoodParams();
	mockFromExtractNoteResult = [];
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: Extract not found"));
});

test(`When non extract creater trying to update note`, async () => {
	const params = getGoodParams();
	mockFromExtractNoteResult = [{ id: 305, user_id: 185693 }];
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: You don't have rights to update the note for this extract."));
});
test(`When non extract creater trying to update note`, async () => {
	const params = getGoodParams();
	mockFromExtractNoteResult = [{ id: 305, user_id: 185693 }];
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: You don't have rights to update the note for this extract."));
});

test(`Return the result true if a note is successfully edited`, async () => {
	const params = getGoodParams();
	expect(await extractNoteUpdate(params)).toEqual(null);
	expect(ctx.body).toEqual({
		result: [
			{
				content: "sd",
				oid: "7a5289732c864505ef154fcbcbf92c99055b",
				page: 123,
				position_x: 0.5,
				position_y: 9.1,
				width: 34,
				height: 45,
				zindex: 34,
			},
		],
	});
});

test(`when no fields will be changed`, async () => {
	let params = getGoodParams();
	delete params.position_x;
	delete params.position_y;
	delete params.width;
	delete params.height;
	delete params.content;
	delete params.page;
	delete params.zindex;
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: No fields changed"));
});

test(`when update current note zindex`, async () => {
	let params = getGoodParams();
	delete params.position_x, delete params.position_y, delete params.width, delete params.height, delete params.content;
	params.zindex = "top";
	expect(await extractNoteUpdate(params)).toEqual(new Error("400 ::: zindex invalid"));
});
