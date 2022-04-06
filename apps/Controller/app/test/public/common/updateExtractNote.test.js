const updateExtractNoteRaw = require("../../../core/public/common/updateExtractNote");

let extractNoteDeleted;

mockQuery = async (query) => {
	query = query.trim().replace(/\s+/g, " ");
	if (query.indexOf(`DELETE FROM`) >= 0) {
		return (extractNoteDeleted = true);
	}
};

/**
 * Reset function - called before each test.
 */
function resetAll() {
	extractNoteDeleted = false;
}
/**
 * Clear everything before and after each test
 */
beforeEach(resetAll);
afterEach(resetAll);

async function updateExtractNote(mockQuery, userId, schoolId, schoolName) {
	let err = null;
	try {
		result = await updateExtractNoteRaw(mockQuery, userId, schoolId, schoolName);
	} catch (e) {
		err = e;
	}
	return err;
}

test(`Success`, async () => {
	expect(await updateExtractNote(mockQuery, 71, [1, 2, 3])).toEqual(null);
	expect(extractNoteDeleted).toEqual(true);
});

test(`If pages is not provided`, async () => {
	expect(await updateExtractNote(mockQuery, 71)).toEqual(null);
	expect(extractNoteDeleted).toEqual(true);
});
