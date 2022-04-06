/**
 * update extract note for updating the page value from page_index
 * @param {*} querier
 */
module.exports = async function updateExtractNote(querier) {
	// fetch extract_note
	const resultExtractNotes = await querier(`
		SELECT
			extract_note.id AS extract_note_id,
			extract_note.page_index AS page_index,
			extract.pages AS pages
		FROM extract_note
			INNER JOIN extract ON
				extract_note.extract_id = extract.id
		ORDER BY
			extract_note.id asc
	`);
	if (!resultExtractNotes.rowCount) {
		console.log("No records found in extract_note");
		return;
	}

	const extractNotes = resultExtractNotes.rows;
	const values = [];
	const binds = [];

	for (const extractNote of extractNotes) {
		const page = extractNote.pages[extractNote.page_index];
		values.push(`($${binds.push(extractNote.extract_note_id)}::integer, $${binds.push(page)}::integer)`);
	}

	//update extract_note
	await querier(
		`
			UPDATE
				extract_note
			SET
				page = v.page
			FROM
				(VALUES ${values.join(", ")})
				AS v(extract_note_id, page)
			WHERE
				extract_note.id = v.extract_note_id
		`,
		binds
	);
};
