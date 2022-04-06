const extractNoteDeleteRaw = require("../../core/public/extract-note-delete");

let ctx;
let mockDeleteFromResult, mockFromExtractNote;

function getGoodSessionData() {
	return {
		user_role: "teacher",
		user_id: 185692,
		school_id: 153,
	};
}

async function getDbQuery(query, values) {
	query = query.replace(/\s+/g, " ");
	if (query.indexOf("SELECT extract_note") !== -1) {
		return {
			rows: mockFromExtractNote,
		};
	}
	if (query.indexOf("UPDATE extract_note") !== -1) {
		return;
	}
	if (query.indexOf("DELETE FROM") !== -1) {
		return {
			rowCount: mockDeleteFromResult,
		};
	}
	throw new Error("should not be here");
}

/**
 * Reset function - called before each test.
 */
function resetAll() {
	mockFromExtractNote = [
		{
			extract_id: 354,
			user_id: 185692,
			zindex: 2,
			page: 4,
		},
	];
	mockDeleteFromResult = 1;
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

async function extractNoteDelete(data) {
	let err = null;
	try {
		ctx.body = await extractNoteDeleteRaw(data, ctx);
	} catch (e) {
		err = e;
	}
	return err;
}

function getGoodParams() {
	return {
		oid: "fac1813fea6267d09149406da6abea1de1ae",
	};
}

test(`Error when requester is not logged in`, async () => {
	const params = getGoodParams();
	ctx.ensureLoggedIn = async (_) => {
		ctx.throw(401, "not logged in");
	};
	expect(await extractNoteDelete(params)).toEqual(new Error("401 ::: not logged in"));
});

test(`Return the deleted true if a extract note is successfully deleted`, async () => {
	const params = getGoodParams();
	expect(await extractNoteDelete(params)).toBeNull();
	expect(ctx.body).toEqual({ result: true });
});

test(`Return the deleted false if a extract note is not successfully deleted`, async () => {
	const params = getGoodParams();
	mockDeleteFromResult = [{ rowCount: 0 }];
	expect(await extractNoteDelete(params)).toBe(null);
	expect(ctx.body).toEqual({ result: false });
});

test(`When user is not associated with a school and trying to delete note`, async () => {
	const params = getGoodParams();
	ctx.getSessionData = async (_) => {
		const s = getGoodSessionData();
		delete s.school_id;
		return s;
	};
	expect(await extractNoteDelete(params)).toEqual(new Error("401 ::: You must be associated with a school to create an Notes"));
});
