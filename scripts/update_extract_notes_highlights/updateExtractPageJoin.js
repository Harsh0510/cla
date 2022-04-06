module.exports = async function updateExtractPageJoin(querier) {
	// fetch extract_page_join
	const resultExtractPageJoins = await querier(`
		SELECT
			extract_page_join.extract_id AS extract_id,
			extract_page_join.page_index AS page_index,
			extract.pages AS pages
		FROM extract_page_join
			INNER JOIN extract ON
			extract_page_join.extract_id = extract.id
	`);
	if (!resultExtractPageJoins.rowCount) {
		console.log("No records found in extract_page_join");
		return;
	}

	const extractPageJoins = resultExtractPageJoins.rows;
	const values = [];
	const binds = [];

	for (const extractPageJoin of extractPageJoins) {
		const page = extractPageJoin.pages[extractPageJoin.page_index];
		values.push(
			`($${binds.push(extractPageJoin.extract_id)}::integer, $${binds.push(extractPageJoin.page_index)}::integer, $${binds.push(page)}::integer)`
		);
	}
	//update extract_page_join
	await querier(
		`
			UPDATE
				extract_page_join
			SET
				page = v.page
			FROM
				(VALUES ${values.join(", ")})
				AS v(extract_id, page_index, page)
			WHERE
				extract_page_join.extract_id = v.extract_id
				AND extract_page_join.page_index = v.page_index
		`,
		binds
	);
};
