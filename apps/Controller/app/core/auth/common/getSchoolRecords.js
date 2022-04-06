async function getSchoolRecords(ctx, columns, caseColumns, whereClauses, tableJoins, limit, binds) {
	const query_columns = columns.length > 0 ? columns.join(", ") : "";
	const query_caseColumns = caseColumns.length > 0 ? caseColumns.join(" ") : "";
	const query_whereClauses = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
	const query_tableJoins = tableJoins.length > 0 ? tableJoins.join(" ") : "";

	result = await ctx.appDbQuery(
		`
		SELECT
			${query_columns}
			${query_caseColumns}
		FROM school
		${query_tableJoins}
		${query_whereClauses}
		GROUP BY school.id
		ORDER BY school.name ASC
		LIMIT ${limit}
	`,
		binds
	);

	return {
		result: result,
	};
}

module.exports = getSchoolRecords;
