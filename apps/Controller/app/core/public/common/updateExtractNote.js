/**
 * Delete notes after update the extract pages
 * @param {*} querier
 * @param {*} extractId
 * @param {*} newPages
 */
module.exports = async function (querier, extractId, newPages = []) {
	let idx = 1;
	const whereClauses = [];
	const binds = [];
	whereClauses.push(`archive_date IS NULL`);
	whereClauses.push(`extract_id = $${idx++}`);
	binds.push(extractId);
	if (newPages.length) {
		whereClauses.push(`page NOT IN (${newPages.join(", ")})`);
	}
	const whereClausesSql = whereClauses.join(" AND ");

	await querier(
		`
			DELETE FROM
				extract_note
			WHERE
				${whereClausesSql}
		`,
		binds
	);
};
