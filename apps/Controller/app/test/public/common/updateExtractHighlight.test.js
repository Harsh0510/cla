const updateExtractHighlightRaw = require("../../../core/public/common/updateExtractHighlight");
const Context = require("../../common/Context");

let extractHighlightDeleted;

mockQuery = async (query) => {
	query = query.trim().replace(/\s+/g, " ");
	if (query.indexOf(`DELETE FROM`) >= 0) {
		return (extractHighlightDeleted = true);
	}
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	extractHighlightDeleted = false;
}
/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function updateExtractHighlight(mockQuery, userId, schoolId, schoolName) {
	let err = null;
	try {
		result = await updateExtractHighlightRaw(mockQuery, userId, schoolId, schoolName);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Success`, async () => {
	expect(await updateExtractHighlight(mockQuery, 71, [1, 2, 3])).toEqual(null);
	expect(extractHighlightDeleted).toEqual(true);
});

test(`If pages is not provided`, async () => {
	expect(await updateExtractHighlight(mockQuery, 71)).toEqual(null);
	expect(extractHighlightDeleted).toEqual(true);
});
