module.exports = async function updateExtractHighlight(querier) {
	// fetch extract_highlight
	const resultExtractHighlights = await querier(`
		SELECT
			extract_highlight.id AS extract_highlight_id,
			extract_highlight.page_index AS page_index,
			extract.pages AS pages
		FROM extract_highlight
			INNER JOIN extract ON
				extract_highlight.extract_id = extract.id
		ORDER BY
			extract_highlight.id asc
	`);
	if (!resultExtractHighlights.rowCount) {
		console.log("No records found in extract_highlight");
		return;
	}

	const extractHighlights = resultExtractHighlights.rows;
	const values = [];
	const binds = [];

	for (const extractHighlight of extractHighlights) {
		const page = extractHighlight.pages[extractHighlight.page_index];
		values.push(`($${binds.push(extractHighlight.extract_highlight_id)}::integer, $${binds.push(page)}::integer)`);
	}

	//update extract_highlight
	await querier(
		`
			UPDATE
				extract_highlight
			SET
				page = v.page
			FROM
				(VALUES ${values.join(", ")})
				AS v(extract_highlight_id, page)
			WHERE
				extract_highlight.id = v.extract_highlight_id
		`,
		binds
	);
};
