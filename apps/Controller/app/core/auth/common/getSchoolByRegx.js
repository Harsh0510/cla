const getSchoolRecords = require("./getSchoolRecords");

module.exports = async function (
	ctx,
	postcodeRegex,
	query,
	whereClauses,
	columns,
	caseColumns,
	tableJoins,
	limit,
	binds,
	isPartial,
	searchInTsVector
) {
	const match = postcodeRegex.exec(query);
	if (match) {
		const newBinds = binds.slice(0);
		const newWhereClauses = whereClauses.slice(0);
		const bindQuery = newBinds.push(match[1].toLowerCase());
		const matchLen = match[1].length;
		const restOfQueryFirstPart = query.slice(0, match.index).trim();
		const restOfQueryLastPart = query.slice(match.index + matchLen).trim();
		const restOfQuery = (restOfQueryFirstPart + " " + restOfQueryLastPart).trim();

		if (isPartial) {
			newWhereClauses.push(`(postcode_first_part_lower = $${bindQuery})`);
		} else {
			newWhereClauses.push(`(postcode_lower = $${bindQuery})`);
		}
		if (restOfQuery) {
			if (searchInTsVector) {
				newWhereClauses.push(`(public_keywords @@ plainto_tsquery($${newBinds.push(restOfQuery)}))`);
			} else if (!searchInTsVector) {
				const bindQuery = newBinds.push("%" + restOfQuery.toLowerCase() + "%");
				newWhereClauses.push(`(public_combined_keywords LIKE $${bindQuery})`);
			}
		}

		/**
		 * So if e.g. the user searches for 'foo EC1V 1NB bar', then this will search for:
		 * postcode_lower = ec1v 1nb AND public_keywords matches 'foo bar'.
		 *
		 * In other words, it will extract the postcode from the query, and also use the
		 * rest of the query.
		 *
		 * So if e.g. the user searches for `wc1a `, then this will search for:
		 * postcode_first_part_lower = wca1 1nb AND public_keywords matches 'wca1'.
		 */
		const schoolRecords = await getSchoolRecords(ctx, columns, caseColumns, newWhereClauses, tableJoins, limit, newBinds);

		return schoolRecords;
	}
	return null;
};
