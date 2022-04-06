module.exports = async function (querier, queryParams) {
	const whereClauses = [];
	const binds = [];

	if (queryParams.firstCategory) {
		whereClauses.push(`(first_category = $${binds.push(queryParams.firstCategory)})`);
	}
	if (queryParams.dateInserted) {
		whereClauses.push(`(date_inserted >= $${binds.push(queryParams.dateInserted)})`);
	}
	if (queryParams.eventTypes && Array.isArray(queryParams.eventTypes)) {
		const eventTypeBinds = [];
		for (const eventType of queryParams.eventTypes) {
			eventTypeBinds.push("$" + binds.push(eventType));
		}
		whereClauses.push(`(event_type IN (${eventTypeBinds.join(",")}))`);
	}
	if (queryParams.url) {
		whereClauses.push(`(url LIKE $${binds.push("%" + queryParams.url + "%")})`);
	}

	//final where Clauses
	const queryWhereClause = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";
	const result = await querier(
		`
			SELECT
				school.id AS id,
				COUNT(v.target_email) AS value
			FROM (
				SELECT
					MIN(target_email) as target_email
				FROM
					email_activity_log
					${queryWhereClause}
				GROUP BY
					sg_message_id
			) v
			INNER JOIN cla_user
				ON v.target_email = cla_user.email
			INNER JOIN school
				ON cla_user.school_id = school.id
			WHERE
				school.wonde_identifier IS NOT NULL
				AND school.wonde_approved = TRUE
			GROUP BY
				school.id
		`,
		binds
	);
	const mapDataBySchoolId = Object.create(null);
	for (const school of result.rows) {
		mapDataBySchoolId[school.id] = parseInt(school.value, 10);
	}
	return mapDataBySchoolId;
};
