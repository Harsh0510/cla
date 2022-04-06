const extractHighlightCreateRaw = require("../../core/public/extract-highlight-create");

let ctx;
let isNeedToAddPageFirstDate = false;
let mockFromExtractResult = [],
	mockFromIsHighlightFirst = {},
	mockFromIsUserData = [],
	mockInsertExtractPageJoin = [],
	mockInsertExtractHighlight = [],
	mockRowCountIsHighlightFirst = 0;

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
	if (query.indexOf("FROM extract_page_join") !== -1) {
		return {
			rows: mockFromIsHighlightFirst,
			rowCount: mockRowCountIsHighlightFirst,
		};
	}
	if (query.indexOf("FROM cla_user ") !== -1) {
		isNeedToAddPageFirstDate = true;
		return {
			rows: mockFromIsUserData,
		};
	}
	if (query.indexOf("INSERT INTO extract_page_join ") !== -1) {
		return {
			rows: mockInsertExtractPageJoin,
		};
	}
	if (query.indexOf("INSERT INTO extract_highlight ") !== -1) {
		return {
			rows: mockInsertExtractHighlight,
		};
	}
	throw new Error("should not be here");
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockRowCountIsHighlightFirst = 1;
	mockInsertExtractPageJoin = [
		{
			extract_id: 552,
			first_highlight_name: `concat_ws('', cla_user.title, '. ', cla_user.last_name)`,
			first_highlight_date: "2020-11-05 13:35:29.511559+00",
			page: 2,
		},
	];
	mockFromIsUserData = [{ name_display_preference: `concat_ws('', cla_user.title, '. ', cla_user.last_name)` }];
	mockFromIsHighlightFirst = [
		{
			first_highlight_name: `concat_ws('', cla_user.title, '. ', cla_user.last_name)`,
			first_highlight_date: "2020-11-05 13:35:29.511559+00",
		},
	];
	mockFromExtractResult = [{ extract_id: 305, user_id: 185692 }];
	mockInsertExtractHighlight = [
		{
			oid: "7a5289732c864505ef154fcbcbf92c99055b",
			extract_id: 552,
			colour: "#2345",
			position_x: 0.5,
			position_y: 9.1,
			width: 34,
			height: 45,
			page: 123,
			date_created: "2020-11-05 13:35:29.511559+00",
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

async function extractHighlightCreate(data) {
	let err = null;
	try {
		ctx.body = await extractHighlightCreateRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		extract_oid: "7a5289732c864505ef154fcbcbf92c99055b",
		extract_id: 525,
		colour: "#2345",
		position_x: 0.5,
		position_y: 9.1,
		width: 34,
		height: 45,
		page: 123,
	};
}

test(`Error when requester is not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractHighlightCreate(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Error when invalid Extract oid is provided`, async () => {
	const params = getGoodParams();
	params.extract_oid = "7a5289732c864505ef154fcbcbf92c9";
	expect(await extractHighlightCreate(params)).toEqual(new Error("400 ::: Extract OId not valid"));
});

test(`Error when width should not be the real type`, async () => {
	const params = getGoodParams();
	params.width = "ab";
	expect(await extractHighlightCreate(params)).toEqual(new Error("400 ::: Width should be the real type"));
});

test(`Error when height should not be the real type`, async () => {
	const params = getGoodParams();
	params.height = "ac";
	expect(await extractHighlightCreate(params)).toEqual(new Error("400 ::: Height should be the real type"));
});

test(`Error when position x should not be the real type`, async () => {
	const params = getGoodParams();
	params.position_x = "ab";
	expect(await extractHighlightCreate(params)).toEqual(new Error("400 ::: Position x should be the real type"));
});

test(`Error when position y should not be the real type`, async () => {
	const params = getGoodParams();
	params.position_y = "xr";
	expect(await extractHighlightCreate(params)).toEqual(new Error("400 ::: Position y should be the real type"));
});

test(`Error when colour is not provided`, async () => {
	const params = getGoodParams();
	delete params.colour;
	expect(await extractHighlightCreate(params)).toEqual(new Error("400 ::: Colour not provided"));
});

test(`Error when colour provided is invalid`, async () => {
	const params = getGoodParams();
	params.colour = "#263478627834";
	expect(await extractHighlightCreate(params)).toEqual(new Error("400 ::: Colour must be between 1 and 10 characters"));
});

test(`Successfully created highlight for an extract!`, async () => {
	const params = getGoodParams();
	expect(await extractHighlightCreate(params)).toBe(null);
	expect(ctx.body).not.toEqual(null);
});

test(`When non extract creater trying to create an highlight`, async () => {
	const params = getGoodParams();
	mockFromExtractResult = [{ extract_id: 305, user_id: 185693 }];
	expect(await extractHighlightCreate(params)).toEqual(new Error("400 ::: You don't have rights to create the highlight for this extract."));
});

test(`Error when extract is not found`, async () => {
	const params = getGoodParams();
	mockFromExtractResult = [];
	expect(await extractHighlightCreate(params)).toEqual(new Error("400 ::: Extract not found"));
});

test(`When the first highlight is added for an extract`, async () => {
	const params = getGoodParams();
	mockFromIsHighlightFirst = [];
	mockRowCountIsHighlightFirst = 0;
	expect(await extractHighlightCreate(params)).toEqual(null);
	expect(isNeedToAddPageFirstDate).toBe(true);
});

test(`If a highlight is then added to an extract again (after they're all removed)`, async () => {
	const params = getGoodParams();
	mockFromIsHighlightFirst = [
		{
			first_highlight_name: null,
			first_highlight_date: "2020-11-05 13:35:29.511559+00",
		},
	];
	expect(await extractHighlightCreate(params)).toEqual(null);
	expect(isNeedToAddPageFirstDate).toBe(true);
});
